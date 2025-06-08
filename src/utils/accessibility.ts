// Utility functions for accessibility

export function generateAriaLabel(
  context: string,
  value?: string | number,
  units?: string
): string {
  if (value !== undefined) {
    const formattedValue = typeof value === 'number' 
      ? value.toLocaleString('en-GB') 
      : value
    return `${context}: ${formattedValue}${units ? ` ${units}` : ''}`
  }
  return context
}

export function formatCurrencyForScreenReader(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  
  if (amount < 0) {
    return `negative ${formatted}`
  }
  return formatted
}

export function formatDateForScreenReader(date: string): string {
  const parsed = new Date(date)
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function generateTableDescription(
  totalRows: number,
  totalColumns: number,
  purpose: string
): string {
  return `${purpose} table with ${totalRows} rows and ${totalColumns} columns. Use arrow keys to navigate between cells.`
}

export function createKeyboardInstructions(): Record<string, string> {
  return {
    tables: 'Use Tab to move between interactive elements, arrow keys to navigate table cells, and Enter or Space to activate buttons.',
    forms: 'Use Tab to move between fields, Enter to submit, and Escape to cancel.',
    lists: 'Use Tab to move between items, Enter or Space to select, and arrow keys for additional navigation.',
    dialogs: 'Use Tab to move between controls, Escape to close, and Enter to confirm.',
    charts: 'Use Tab to focus on chart elements, arrow keys to navigate data points, and Enter for details.'
  }
}
