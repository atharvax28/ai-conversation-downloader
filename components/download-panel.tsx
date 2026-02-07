"use client"

import React from "react"

import { useState } from "react"
import type { ConversationMessage } from "@/lib/conversation-parser"
import {
  generateFullText,
  generateSelectedText,
  getRecentCodeBlocks,
  getAllCodeBlocks,
  downloadFile,
  downloadAllCode,
} from "@/lib/conversation-parser"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DownloadPanelProps {
  messages: ConversationMessage[]
  selectedIds: Set<string>
}

interface DownloadOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  disabled?: boolean
  disabledReason?: string
  action: () => void
}

export function DownloadPanel({ messages, selectedIds }: DownloadPanelProps) {
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  const recentCode = getRecentCodeBlocks(messages)
  const allCode = getAllCodeBlocks(messages)

  const handleDownload = (id: string, action: () => void) => {
    action()
    setDownloadedId(id)
    setTimeout(() => setDownloadedId(null), 2000)
  }

  const options: DownloadOption[] = [
    {
      id: "full-text",
      title: "Full Text",
      description: "Download the entire conversation as plain text with all input and output",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: `${messages.length} messages`,
      action: () => {
        const text = generateFullText(messages)
        downloadFile(text, "conversation-full.txt")
      },
    },
    {
      id: "selected",
      title: "Selected Sections",
      description: "Download only the conversation sections you have selected",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badge: selectedIds.size > 0 ? `${selectedIds.size} selected` : undefined,
      disabled: selectedIds.size === 0,
      disabledReason: "Select messages above first",
      action: () => {
        const text = generateSelectedText(messages, selectedIds)
        downloadFile(text, "conversation-selected.txt")
      },
    },
    {
      id: "recent-code",
      title: "Recent Output Code",
      description: "Download code blocks from only the most recent assistant response",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      badge: recentCode.length > 0 ? `${recentCode.length} blocks` : undefined,
      disabled: recentCode.length === 0,
      disabledReason: "No code in recent output",
      action: () => {
        if (recentCode.length === 1) {
          downloadFile(recentCode[0].code, recentCode[0].filename)
        } else {
          const combined = recentCode
            .map((b) => `// ===== ${b.filename} (${b.language}) =====\n\n${b.code}`)
            .join("\n\n\n")
          downloadFile(combined, "recent-code.txt")
        }
      },
    },
    {
      id: "all-code",
      title: "Download All Code",
      description: "Download every code block found across the entire conversation",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      badge: allCode.length > 0 ? `${allCode.length} blocks` : undefined,
      disabled: allCode.length === 0,
      disabledReason: "No code blocks found",
      action: () => {
        downloadAllCode(allCode)
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Download Options</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to export your conversation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const isDownloaded = downloadedId === opt.id
          return (
            <button
              key={opt.id}
              disabled={opt.disabled}
              onClick={() => handleDownload(opt.id, opt.action)}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all",
                opt.disabled
                  ? "cursor-not-allowed border-border/50 opacity-50"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-pointer",
                isDownloaded && "border-primary/60 bg-primary/10"
              )}
            >
              <div className="flex w-full items-start justify-between">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    opt.disabled
                      ? "bg-muted text-muted-foreground"
                      : isDownloaded
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  {isDownloaded ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    opt.icon
                  )}
                </div>
                {opt.badge && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-muted-foreground/20 text-muted-foreground font-mono"
                  >
                    {opt.badge}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {isDownloaded ? "Downloaded!" : opt.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {opt.disabled && opt.disabledReason
                    ? opt.disabledReason
                    : opt.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {allCode.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Code Blocks Summary</h3>
          <div className="flex flex-wrap gap-2">
            {allCode.map((block) => (
              <button
                key={block.id}
                onClick={() => downloadFile(block.code, block.filename)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {block.filename}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
