"use client"

import { useState } from "react"
import { ConversationInput } from "@/components/conversation-input"
import { ConversationViewer } from "@/components/conversation-viewer"
import { DownloadPanel } from "@/components/download-panel"
import {
  parseConversation,
  type ConversationMessage,
} from "@/lib/conversation-parser"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isParsed, setIsParsed] = useState(false)

  const handleParse = (text: string) => {
    const parsed = parseConversation(text)
    setMessages(parsed)
    setSelectedIds(new Set(parsed.map((m) => m.id)))
    setIsParsed(true)
  }

  const handleReset = () => {
    setMessages([])
    setSelectedIds(new Set())
    setIsParsed(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">AI Conversation Downloader</h1>
              <p className="text-xs text-muted-foreground">Parse, extract, and download</p>
            </div>
          </div>
          {isParsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Conversation
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {!isParsed ? (
          <div className="flex flex-col gap-8">
            {/* Hero section */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground text-balance sm:text-3xl">
                AI Conversation Downloader
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
                Paste any AI conversation to parse it into structured messages, extract code blocks,
                and download exactly what you need.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Full Text Export", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { label: "Selected Sections", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                { label: "Recent Code Only", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
                { label: "Download All Code", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground"
                >
                  <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feat.icon} />
                  </svg>
                  {feat.label}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <ConversationInput onParse={handleParse} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats bar */}
            <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
              <StatItem
                label="Messages"
                value={messages.length}
                color="text-foreground"
              />
              <Separator orientation="vertical" className="h-8" />
              <StatItem
                label="User"
                value={messages.filter((m) => m.role === "user").length}
                color="text-muted-foreground"
              />
              <Separator orientation="vertical" className="h-8" />
              <StatItem
                label="Assistant"
                value={messages.filter((m) => m.role === "assistant").length}
                color="text-primary"
              />
              <Separator orientation="vertical" className="h-8" />
              <StatItem
                label="Code Blocks"
                value={messages.flatMap((m) => m.codeBlocks).length}
                color="text-primary"
              />
            </div>

            {/* Download Options */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <DownloadPanel messages={messages} selectedIds={selectedIds} />
            </div>

            {/* Conversation Viewer */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <ConversationViewer
                messages={messages}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            AI Conversation Downloader &middot; Parse and export AI conversations with ease
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex flex-col">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}
