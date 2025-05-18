"use client"

import { useState, useMemo } from "react"
import type { ChatMessage as ChatMessageType } from "@/lib/features/chat/chatSlice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Download, Check, ArrowDown, ArrowUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { exportTableToCSV } from "@/lib/utils/export-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataVisualization from "@/components/data-visualization"

interface ChatMessageProps {
  message: ChatMessageType
  onSuggestionClick: (suggestion: string) => void
}

export default function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const [showSql, setShowSql] = useState(false)
  const [expandedTable, setExpandedTable] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Format the timestamp if available
  const formattedTime = message.created_at
    ? format(new Date(message.created_at), "MMM d, h:mm a")
    : format(new Date(), "MMM d, h:mm a")

  // Sort table data
  const sortedData = useMemo(() => {
    if (!message.result?.result.results || !sortColumn) {
      return message.result?.result.results || []
    }

    return [...message.result.result.results].sort((a, b) => {
      const valueA = a[sortColumn]
      const valueB = b[sortColumn]

      // Handle different data types
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      }

      // Convert to strings for comparison
      const strA = String(valueA || "").toLowerCase()
      const strB = String(valueB || "").toLowerCase()

      if (sortDirection === "asc") {
        return strA.localeCompare(strB)
      } else {
        return strB.localeCompare(strA)
      }
    })
  }, [message.result?.result.results, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

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

  // Check if data is suitable for visualization
  const canVisualize = useMemo(() => {
    if (!message.result?.result.results || message.result.result.results.length === 0) {
      return false
    }

    // Check if there's at least one numeric column
    const hasNumericData = message.result.result.columns.some((column) => {
      return message.result?.result.results.some((row) => typeof row[column] === "number")
    })

    return hasNumericData
  }, [message.result?.result.results, message.result?.result.columns])

  return (
    <div className="space-y-6 py-2">
      {/* User question */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 border">
          <AvatarImage src="/assistant.png?height=32&width=32" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {message.user_id === 0 ? "U" : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">User</span>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
          <p className="mt-1">{message.question}</p>
        </div>
      </div>

      {/* Assistant response */}
      {message.result && (
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="/user.png?height=32&width=32" />
            <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
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
                    ? `Please check this result.`
                    : `Several items show significant results in the query. The data reveals important patterns that may require attention.`}
                </p>
              </div>

              {/* Results Tabs (Table and Visualization) */}
              <Tabs defaultValue="table" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <TabsList>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    {canVisualize && <TabsTrigger value="visualization">Visualization</TabsTrigger>}
                  </TabsList>

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
                  </div>
                </div>

                <TabsContent value="table" className="mt-0">
                  <Card className="overflow-hidden border rounded-md">
                    <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                      <div className="font-medium">Results</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedTable(!expandedTable)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
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
                                    "bg-muted/30 text-xs uppercase tracking-wider font-medium text-muted-foreground cursor-pointer",
                                    i === 0 && "sticky left-0 bg-muted/30 z-10",
                                  )}
                                  onClick={() => handleSort(column)}
                                >
                                  <div className="flex items-center">
                                    {column}
                                    {sortColumn === column && (
                                      <span className="ml-1">
                                        {sortDirection === "asc" ? (
                                          <ArrowUp className="h-3 w-3" />
                                        ) : (
                                          <ArrowDown className="h-3 w-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedData.map((row, i) => (
                              <TableRow key={i} className="hover:bg-muted/30">
                                {message.result?.result?.columns?.map((column, j) => (
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
                </TabsContent>

                {canVisualize && (
                  <TabsContent value="visualization" className="mt-0">
                    <Card className="overflow-hidden border rounded-md">
                      <div className="p-3 bg-muted/50 border-b">
                        <div className="font-medium">Data Visualization</div>
                      </div>
                      <div className="p-4">
                        <DataVisualization
                          data={message.result.result.results}
                          columns={message.result.result.columns}
                        />
                      </div>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>

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
