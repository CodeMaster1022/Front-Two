"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts"

interface DataVisualizationProps {
  data: any[]
  columns: string[]
}

export default function DataVisualization({ data, columns }: DataVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState("bar")
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)

  // Find numeric and categorical columns
  const columnTypes = useMemo(() => {
    const types: Record<string, "numeric" | "categorical"> = {}

    columns.forEach((column) => {
      // Check if column has numeric values
      const hasNumeric = data.some((row) => typeof row[column] === "number")
      types[column] = hasNumeric ? "numeric" : "categorical"
    })

    return types
  }, [data, columns])

  // Get numeric columns for metrics
  const numericColumns = useMemo(() => {
    return columns.filter((col) => columnTypes[col] === "numeric")
  }, [columns, columnTypes])

  // Get categorical columns for dimensions
  const categoricalColumns = useMemo(() => {
    return columns.filter((col) => columnTypes[col] === "categorical")
  }, [columns, columnTypes])

  // Set default selections if not already set
  useMemo(() => {
    if (numericColumns.length > 0 && !selectedMetric) {
      setSelectedMetric(numericColumns[0])
    }
    if (categoricalColumns.length > 0 && !selectedDimension) {
      setSelectedDimension(categoricalColumns[0])
    }
  }, [numericColumns, categoricalColumns, selectedMetric, selectedDimension])

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!selectedMetric || !selectedDimension || !data.length) {
      return { labels: [], values: [] }
    }

    // Group data by dimension and aggregate metric
    const groupedData: Record<string, number[]> = {}

    data.forEach((row) => {
      const dimension = String(row[selectedDimension] || "Unknown")
      const metric = Number(row[selectedMetric] || 0)

      if (!groupedData[dimension]) {
        groupedData[dimension] = []
      }

      groupedData[dimension].push(metric)
    })

    // Calculate average for each dimension
    const labels = Object.keys(groupedData)
    const values = labels.map((label) => {
      const metrics = groupedData[label]
      const sum = metrics.reduce((acc, val) => acc + val, 0)
      return sum / metrics.length
    })

    return { labels, values }
  }, [data, selectedMetric, selectedDimension])

  if (!data.length || numericColumns.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No data available for visualization</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chart Type</label>
          <Tabs value={selectedChart} onValueChange={setSelectedChart} className="w-[300px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="pie">Pie</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Metric</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedMetric || ""}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {numericColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Dimension</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedDimension || ""}
            onChange={(e) => setSelectedDimension(e.target.value)}
          >
            {categoricalColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {selectedChart === "bar" && (
          <BarChart
            labels={chartData.labels}
            datasets={[
              {
                label: selectedMetric || "",
                data: chartData.values,
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
              },
            ]}
          />
        )}

        {selectedChart === "line" && (
          <LineChart
            labels={chartData.labels}
            datasets={[
              {
                label: selectedMetric || "",
                data: chartData.values,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.3,
              },
            ]}
          />
        )}

        {selectedChart === "pie" && (
          <PieChart
            labels={chartData.labels}
            datasets={[
              {
                data: chartData.values,
                backgroundColor: [
                  "rgba(59, 130, 246, 0.7)",
                  "rgba(16, 185, 129, 0.7)",
                  "rgba(249, 115, 22, 0.7)",
                  "rgba(139, 92, 246, 0.7)",
                  "rgba(236, 72, 153, 0.7)",
                  "rgba(234, 179, 8, 0.7)",
                ],
                borderColor: "white",
                borderWidth: 1,
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
