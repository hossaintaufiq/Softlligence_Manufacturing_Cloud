import type { Request, Response, NextFunction } from 'express';
import { getExecutiveKpis } from './analytics.service.js';
import { generateCustomReport } from './reportBuilder.service.js';

export async function handleGetKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth?.user.tenantId || null;
    const kpis = await getExecutiveKpis(tenantId);
    res.json(kpis);
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { reportType, groupBy } = req.body ?? {};
    const tenantId = req.auth?.user.tenantId || null;
    const rows = await generateCustomReport({
      reportType: reportType || 'production_summary',
      groupBy: groupBy || 'shift',
      tenantId,
    });
    res.json({ rows });
  } catch (err) {
    next(err);
  }
}

export async function handleExportReportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const reportType = String(req.query.reportType || 'production_summary') as any;
    const groupBy = String(req.query.groupBy || 'shift') as any;
    const tenantId = req.auth?.user.tenantId || null;

    const rows = await generateCustomReport({ reportType, groupBy, tenantId });

    let csv = 'Group Name,Total Records,Input Kg,Output Kg,Yield Pct,Power kWh\n';
    for (const r of rows) {
      csv += `"${r.groupName}",${r.totalRecords},${r.inputKg},${r.outputKg},${r.yieldPct}%,${r.powerKwh}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics_${reportType}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
