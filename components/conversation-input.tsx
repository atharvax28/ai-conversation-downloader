"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getSampleConversation } from "@/lib/sample-data"

interface ConversationInputProps {
  onParse: (text: string) => void
}

export function ConversationInput({ onParse }: ConversationInputProps) {
  const [text, setText] = useState("")

  const handleParse = () => {
    if (text.trim()) {
      onParse(text)
    }
  }

  const handleLoadSample = () => {
    setText(getSampleConversation())
  }

  const handleClear = () => {
    setText("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Paste Conversation</h2>
          <p className="text-sm text-muted-foreground">
            {"Paste your AI conversation below using \"User:\" and \"Assistant:\" prefixes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs text-muted-foreground hover:text-foreground">
            Load Sample
          </Button>
          {text && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground hover:text-destructive">
              Clear
            </Button>
          )}
        </div>
      </div>
      <Textarea
        placeholder={"User: What is React?\n\nAssistant: React is a JavaScript library..."}
        className="min-h-[240px] resize-y bg-muted/50 border-border font-mono text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {text.length > 0 ? `${text.length.toLocaleString()} characters` : "No content yet"}
        </p>
        <Button onClick={handleParse} disabled={!text.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Parse Conversation
        </Button>
      </div>
    </div>
  )
}
