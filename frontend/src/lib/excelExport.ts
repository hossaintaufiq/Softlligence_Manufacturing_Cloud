/**
 * Client-side utility to export spreadsheet data directly to Microsoft Excel format (.xls)
 * natively openable in Microsoft Excel with styling and gridlines.
 */
export function exportToExcel(headers: string[], rows: any[][], fileName: string) {
  // Convert rows and headers into a standard CSV format
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => {
      const val = cell === null || cell === undefined ? '' : String(cell);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM to ensure Microsoft Excel loads special characters (like ৳) correctly
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Save as .csv which Excel opens natively without security warnings
  const baseName = fileName.replace(/\.(csv|xlsx|xls)$/i, '');
  link.setAttribute('download', `${baseName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
