"use client"

import { useState } from "react"
import type { ConversationMessage } from "@/lib/conversation-parser"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ConversationViewerProps {
  messages: ConversationMessage[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
}

export function ConversationViewer({
  messages,
  selectedIds,
  onSelectionChange,
}: ConversationViewerProps) {
  const [expandedCode, setExpandedCode] = useState<Set<string>>(new Set())

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectionChange(next)
  }

  const selectAll = () => {
    onSelectionChange(new Set(messages.map((m) => m.id)))
  }

  const deselectAll = () => {
    onSelectionChange(new Set())
  }

  const toggleCodeExpand = (codeId: string) => {
    const next = new Set(expandedCode)
    if (next.has(codeId)) {
      next.delete(codeId)
    } else {
      next.add(codeId)
    }
    setExpandedCode(next)
  }

  // Get text content without code blocks for preview
  const getPreviewText = (content: string) => {
    return content
      .replace(/```[\s\S]*?```/g, "[code block]")
      .trim()
      .slice(0, 200)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""} parsed
          {selectedIds.size > 0 && (
            <span className="ml-2 text-primary">
              ({selectedIds.size} selected)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Select all
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            onClick={deselectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Deselect all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "group relative flex gap-3 rounded-lg border p-4 transition-all cursor-pointer",
              selectedIds.has(msg.id)
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/20"
            )}
            onClick={() => toggleSelection(msg.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                toggleSelection(msg.id)
              }
            }}
          >
            <div className="pt-0.5">
              <Checkbox
                checked={selectedIds.has(msg.id)}
                onCheckedChange={() => toggleSelection(msg.id)}
                onClick={(e) => e.stopPropagation()}
                className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant={msg.role === "user" ? "outline" : "secondary"}
                  className={cn(
                    "text-xs font-mono uppercase tracking-wider",
                    msg.role === "user"
                      ? "border-muted-foreground/30 text-muted-foreground"
                      : "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {msg.role}
                </Badge>
                {msg.codeBlocks.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {msg.codeBlocks.length} code block{msg.codeBlocks.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                {getPreviewText(msg.content)}
              </p>

              {msg.codeBlocks.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {msg.codeBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-md border border-border bg-muted/40 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted/60 transition-colors"
                        onClick={() => toggleCodeExpand(block.id)}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span className="font-mono text-foreground/70">{block.filename}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground/20 text-muted-foreground">
                            {block.language}
                          </Badge>
                        </span>
                        <svg
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform",
                            expandedCode.has(block.id) && "rotate-180"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedCode.has(block.id) && (
                        <pre className="px-3 pb-3 pt-1 text-xs font-mono text-foreground/70 overflow-x-auto max-h-[200px] overflow-y-auto">
                          <code>{block.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
