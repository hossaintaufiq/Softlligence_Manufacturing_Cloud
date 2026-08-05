import type { Request, Response, NextFunction } from 'express';
import { getComplianceRecords, createESignatureSignoff } from './compliance.service.js';

export async function handleGetCompliance(_req: Request, res: Response, next: NextFunction) {
  try {
    const records = await getComplianceRecords();
    res.json({ records });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateESignature(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentRef, signerName, signerRole } = req.body ?? {};
    const signoff = await createESignatureSignoff(
      String(documentRef || 'DOC-RELEASE'),
      String(signerName || 'Signer'),
      String(signerRole || 'Quality Inspector')
    );
    res.json({ ok: true, signoff });
  } catch (err) {
    next(err);
  }
}
