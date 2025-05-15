/**
 * Converts table data to CSV format and triggers a download
 * @param columns Array of column names
 * @param data Array of data objects
 * @param filename Name of the file to download
 */
export async function exportTableToCSV(columns: string[], data: any[], filename: string): Promise<void> {
  // Ensure filename has .csv extension
  if (!filename.endsWith(".csv")) {
    filename += ".csv"
  }

  // Function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ""

    const stringValue = String(value)

    // If the value contains commas, quotes, or newlines, wrap it in quotes
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      // Double up any quotes to escape them
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  // Create CSV header row
  const headerRow = columns.map(escapeCSV).join(",")

  // Create CSV data rows
  const dataRows = data.map((row) => {
    return columns.map((col) => escapeCSV(row[col])).join(",")
  })

  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join("\n")

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Add to document, trigger download, and clean up
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Small delay before revoking the object URL
  await new Promise((resolve) => setTimeout(resolve, 100))
  URL.revokeObjectURL(url)
}
