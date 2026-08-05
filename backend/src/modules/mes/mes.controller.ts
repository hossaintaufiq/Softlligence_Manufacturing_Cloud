import type { Request, Response, NextFunction } from 'express';
import { getMachines, logMachineDowntime, getQmsInspections, createQmsInspection } from './mes.service.js';

export async function handleGetMachines(_req: Request, res: Response, next: NextFunction) {
  try {
    const machines = await getMachines();
    res.json({ machines });
  } catch (err) {
    next(err);
  }
}

export async function handleLogDowntime(req: Request, res: Response, next: NextFunction) {
  try {
    const { machineId, downtimeMin, reason } = req.body ?? {};
    const result = await logMachineDowntime(String(machineId), Number(downtimeMin || 0), String(reason || 'Unspecified'));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetQms(_req: Request, res: Response, next: NextFunction) {
  try {
    const inspections = await getQmsInspections();
    res.json({ inspections });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateQms(req: Request, res: Response, next: NextFunction) {
  try {
    const { inspectionNo, entityType, entityId, inspectorName, status, defectCount, remarks } = req.body ?? {};
    const item = await createQmsInspection({
      inspectionNo: String(inspectionNo || `QC-${Date.now()}`),
      entityType: String(entityType || 'general'),
      entityId: String(entityId || 'N/A'),
      inspectorName: String(inspectorName || 'Inspector'),
      status: status || 'PASSED',
      defectCount: Number(defectCount || 0),
      remarks: remarks ? String(remarks) : undefined,
    });
    res.json({ ok: true, item });
  } catch (err) {
    next(err);
  }
}
