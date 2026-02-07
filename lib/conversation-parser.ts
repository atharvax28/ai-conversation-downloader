export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  codeBlocks: CodeBlock[]
}

export interface CodeBlock {
  id: string
  language: string
  filename: string
  code: string
  messageIndex: number
}

/**
 * Parse raw conversation text into structured messages.
 * Supports common AI conversation formats:
 * - "User:" / "Assistant:" or "Human:" / "AI:"
 * - Markdown-style code blocks with ``` delimiters
 */
export function parseConversation(rawText: string): ConversationMessage[] {
  if (!rawText.trim()) return []

  const messages: ConversationMessage[] = []

  // Try to detect structured conversation with role prefixes
  const rolePattern =
    /^(User|Human|You|Me|Assistant|AI|Bot|ChatGPT|Claude|GPT|System)[\s]*[:\-]/im
  const hasRoles = rolePattern.test(rawText)

  if (hasRoles) {
    // Split by role markers
    const parts = rawText.split(
      /^(?=(?:User|Human|You|Me|Assistant|AI|Bot|ChatGPT|Claude|GPT|System)[\s]*[:\-])/im
    )

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      const roleMatch = trimmed.match(
        /^(User|Human|You|Me|Assistant|AI|Bot|ChatGPT|Claude|GPT|System)[\s]*[:\-]\s*/i
      )

      if (roleMatch) {
        const roleName = roleMatch[1].toLowerCase()
        const isUser = ["user", "human", "you", "me"].includes(roleName)
        const content = trimmed.slice(roleMatch[0].length).trim()

        const messageId = `msg-${messages.length}`
        const codeBlocks = extractCodeBlocks(content, messages.length)

        messages.push({
          id: messageId,
          role: isUser ? "user" : "assistant",
          content,
          codeBlocks,
        })
      }
    }
  }

  // Fallback: treat entire input as a single assistant message
  if (messages.length === 0) {
    const codeBlocks = extractCodeBlocks(rawText, 0)
    messages.push({
      id: "msg-0",
      role: "assistant",
      content: rawText.trim(),
      codeBlocks,
    })
  }

  return messages
}

/**
 * Extract fenced code blocks from a message
 */
export function extractCodeBlocks(
  text: string,
  messageIndex: number
): CodeBlock[] {
  const blocks: CodeBlock[] = []
  const codeBlockRegex = /```(\w*)?(?:\s*\/\/\s*(.+?))?(?:\s*#\s*(.+?))?\n([\s\S]*?)```/g

  let match: RegExpExecArray | null
  let idx = 0

  while (true) {
    match = codeBlockRegex.exec(text)
    if (match === null) break

    const language = match[1] || "text"
    const inlineFilename = match[2] || match[3] || ""
    const code = match[4].trim()

    // Try to infer filename from first line comment
    let filename = inlineFilename
    if (!filename) {
      const firstLineComment = code.match(
        /^(?:\/\/|#|\/\*|\{\/\*)\s*(.+?)(?:\*\/|\*\/\})?$/m
      )
      if (
        firstLineComment &&
        firstLineComment[1].includes(".")
      ) {
        filename = firstLineComment[1].trim()
      }
    }

    if (!filename) {
      const extMap: Record<string, string> = {
        typescript: "ts",
        javascript: "js",
        tsx: "tsx",
        jsx: "jsx",
        python: "py",
        css: "css",
        html: "html",
        json: "json",
        sql: "sql",
        bash: "sh",
        shell: "sh",
        yaml: "yml",
        rust: "rs",
        go: "go",
        java: "java",
        text: "txt",
      }
      const ext = extMap[language] || language || "txt"
      filename = `code-${idx + 1}.${ext}`
    }

    blocks.push({
      id: `code-${messageIndex}-${idx}`,
      language,
      filename,
      code,
      messageIndex,
    })
    idx++
  }

  return blocks
}

/**
 * Get all code blocks from the entire conversation
 */
export function getAllCodeBlocks(
  messages: ConversationMessage[]
): CodeBlock[] {
  return messages.flatMap((msg) => msg.codeBlocks)
}

/**
 * Get code blocks from only the most recent assistant message
 */
export function getRecentCodeBlocks(
  messages: ConversationMessage[]
): CodeBlock[] {
  const assistantMessages = messages.filter((m) => m.role === "assistant")
  if (assistantMessages.length === 0) return []
  const last = assistantMessages[assistantMessages.length - 1]
  return last.codeBlocks
}

/**
 * Generate a downloadable text for full conversation
 */
export function generateFullText(messages: ConversationMessage[]): string {
  return messages
    .map((msg) => {
      const roleLabel = msg.role === "user" ? "User" : "Assistant"
      return `${roleLabel}:\n${msg.content}`
    })
    .join("\n\n---\n\n")
}

/**
 * Generate text for selected messages
 */
export function generateSelectedText(
  messages: ConversationMessage[],
  selectedIds: Set<string>
): string {
  return messages
    .filter((msg) => selectedIds.has(msg.id))
    .map((msg) => {
      const roleLabel = msg.role === "user" ? "User" : "Assistant"
      return `${roleLabel}:\n${msg.content}`
    })
    .join("\n\n---\n\n")
}

/**
 * Download content as a file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = "text/plain"
) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download multiple code blocks as a single combined file
 */
export function downloadAllCode(blocks: CodeBlock[]) {
  const combined = blocks
    .map(
      (block) =>
        `// ========== ${block.filename} (${block.language}) ==========\n\n${block.code}`
    )
    .join("\n\n\n")

  downloadFile(combined, "all-code-blocks.txt")
}

/**
 * Create and download a zip-like combined output of all code
 */
export function downloadCodeAsFiles(blocks: CodeBlock[]) {
  // For simplicity, download each as individual file triggers
  for (const block of blocks) {
    downloadFile(block.code, block.filename)
  }
}
