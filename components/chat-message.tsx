"use client"

import { useState } from "react"
import type { ChatMessage as ChatMessageType } from "@/lib/features/chat/chatSlice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Download, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { exportTableToCSV } from "@/lib/utils/export-utils"

interface ChatMessageProps {
  message: ChatMessageType
  onSuggestionClick: (suggestion: string) => void
}

export default function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const [showSql, setShowSql] = useState(false)
  const [expandedTable, setExpandedTable] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Format the timestamp if available
  const formattedTime = message.created_at
    ? format(new Date(message.created_at), "MMM d, h:mm a")
    : format(new Date(), "MMM d, h:mm a")

  const handleExportCSV = async () => {
    if (!message.result?.result.columns || !message.result?.result.results) return

    setExporting(true)

    try {
      // Generate a filename based on the first few words of the question
      const questionWords = message.question.split(" ").slice(0, 3).join("_")
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss")
      const filename = `${questionWords}_${timestamp}.csv`

      await exportTableToCSV(message.result.result.columns, message.result.result.results, filename)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (error) {
      console.error("Error exporting CSV:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 py-2">
      {/* User question */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 border">
        <AvatarImage src="/user.png?height=32&width=36" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {message.user_id === 0 ? "U" : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Sarah</span>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
          <p className="mt-1">{message.question}</p>
        </div>
      </div>

      {/* Assistant response */}
      {message.result && (
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="/assistant.png?height=32&width=36" />
            <AvatarFallback className="bg-secondary text-white">AI</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Assistant</span>
                <span className="text-xs text-muted-foreground">{formattedTime}</span>
              </div>

              {/* Analysis dropdown */}
              <div className="mt-1">
                <Button variant="outline" size="sm" className="mb-2 text-sm font-medium text-muted-foreground">
                  Analysis process
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>

                <p className="mb-4">
                  {message.result.sql.includes("COUNT")
                    ? `There are ${message.result.result.results[0]?.available_vehicles || 0} vehicles currently available.`
                    : `Several items show significant results in the query. The data reveals important patterns that may require attention.`}
                </p>
              </div>

              {/* Results Table */}
              <Card className="overflow-hidden border rounded-md">
                <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                  <div className="font-medium">Results</div>
                  <div className="flex items-center gap-2">
                    {/* Export CSV Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={handleExportCSV}
                      disabled={exporting || !message.result.result.results.length}
                    >
                      {exporting ? (
                        <span className="flex items-center">
                          Exporting<span className="ml-1 animate-pulse">...</span>
                        </span>
                      ) : exportSuccess ? (
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Exported
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          Export CSV
                        </span>
                      )}
                    </Button>

                    {/* Expand/Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTable(!expandedTable)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {expandedTable && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          {message.result.result.columns.map((column, i) => (
                            <TableHead
                              key={i}
                              className={cn(
                                "bg-muted/30 text-xs uppercase tracking-wider font-medium text-muted-foreground",
                                i === 0 && "sticky left-0 bg-muted/30 z-10",
                              )}
                            >
                              {column}
                              {i === 0 && <span className="ml-1 text-muted-foreground">123</span>}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {message.result.result.results.map((row, i) => (
                          <TableRow key={i} className="hover:bg-muted/30">
                            {message.result?.result?.columns.map((column, j) => (
                              <TableCell
                                key={j}
                                className={cn(
                                  "py-2 text-sm",
                                  j === 0 && "sticky left-0 bg-white dark:bg-background z-10 font-medium",
                                )}
                              >
                                {row[column] !== undefined && row[column] !== null ? String(row[column]) : ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="p-3 text-xs text-muted-foreground border-t bg-muted/30 flex justify-between items-center">
                  <div>
                    {message.result.result.row_count} items
                    <span className="mx-1 text-muted-foreground">123</span>
                  </div>
                  <div>
                    {message.result.result.row_count} items
                    <span className="mx-1 text-muted-foreground">123</span>
                  </div>
                </div>
              </Card>

              {/* Feedback buttons */}
              <div className="flex items-center mt-4">
                <span className="text-sm text-muted-foreground mr-2">
                  Leave your impression and save the answer in memory:
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions */}
              {message.result.suggestions && message.result.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {message.result.suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestionClick(suggestion)}
                      className="bg-muted/50 border-muted-foreground/20"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
