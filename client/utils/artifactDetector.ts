// utils/artifactDetector.ts
export interface ArtifactData {
  type: 'table' | 'chart';
  data: any;
  title?: string;
}

export const detectArtifactFromMessage = (message): ArtifactData | null => {
  // Check for table artifact pattern - look for markdown tables
  if (message.content === '') {
    console.log("Empty message content.");
    return null;
  }

  // Look for markdown table pattern (headers with pipes, separator row, and data rows)
  // Find the start of the table and capture everything until we stop seeing table rows
  const tableStartMatch = message.match(/\|.*\|/);
  if (tableStartMatch) {
    const startIndex = tableStartMatch.index!;
    const remainingMessage = message.slice(startIndex);
    
    // Extract all consecutive lines that look like table rows (contain |)
    const lines = remainingMessage.split('\n');
    const tableLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('**แหล่งที่มา:**')) {
        tableLines.push(trimmedLine);
      } else if (tableLines.length > 0) {
        // Stop when we encounter a non-table line after we've started collecting table lines
        break;
      }
    }
    
    if (tableLines.length >= 2) {
      const tableContent = tableLines.join('\n');
      // Verify it's a proper table by checking for header separator (|---|---|)
      if (tableContent.includes('---') || tableContent.includes(':--')) {
        // Extract title from heading above table if present
        const titleMatch = message.match(/##\s*([^\n]+)/);
        const title = titleMatch ? titleMatch[1].trim() : 'Data Table';
        
        return {
          type: 'table',
          data: tableContent,
          title: title
        };
      }
    }
  }

  // Check for chart artifact pattern - look for JSON blocks
  // This regex looks for ```json followed by content until the closing ```
  const chartMatch = message.match(/```json\s*\n([\s\S]*?)```/i);
  if (chartMatch) {
    try {
      const chartData = JSON.parse(chartMatch[1].trim());
      // Verify it's chart data by checking for required properties
      if (chartData.chartType && chartData.data && Array.isArray(chartData.data)) {
        return {
          type: 'chart',
          data: chartData,
          title: chartData.options?.title || 'Chart'
        };
      }
    } catch (error) {
      console.error('Failed to parse chart JSON:', error);
    }
  }

  // Fallback: Check for any JSON block (without specifying language)
  const generalJsonMatch = message.match(/```\s*\n(\{[\s\S]*?\})\s*```/);
  if (generalJsonMatch) {
    try {
      const chartData = JSON.parse(generalJsonMatch[1].trim());
      // Verify it's chart data by checking for required properties
      if (chartData.chartType && chartData.data && Array.isArray(chartData.data)) {
        return {
          type: 'chart',
          data: chartData,
          title: chartData.options?.title || 'Chart'
        };
      }
    } catch (error) {
      console.error('Failed to parse fallback chart JSON:', error);
    }
  }
  return null;
};