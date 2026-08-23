/**
 * Client-side utility to export spreadsheet data directly to Microsoft Excel format (.xls)
 * natively openable in Microsoft Excel with styling and gridlines.
 */
export function exportToExcel(headers: string[], rows: any[][], fileName: string) {
  const tableHeaders = `<tr>${headers.map(h => `<th style="background-color: #FAF6EE; border: 1px solid #C5A059; padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; font-size: 12px; color: #B48F48;">${h}</th>`).join('')}</tr>`;
  const tableRows = rows.map(row => 
    `<tr>${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 6px; font-family: monospace; font-size: 11px;">${cell === null || cell === undefined ? '' : String(cell)}</td>`).join('')}</tr>`
  ).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Sheet1</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      <table>
        <thead>${tableHeaders}</thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Save as .xls which Excel opens natively with the internal XML format
  const baseName = fileName.replace(/\.(csv|xlsx|xls)$/i, '');
  link.setAttribute('download', `${baseName}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
