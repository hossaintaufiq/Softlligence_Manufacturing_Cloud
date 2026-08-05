export type ComplianceAuditRecord = {
  id: string;
  framework: 'ISO_9001' | 'OSHA_SAFETY' | 'FDA_21CFR11';
  auditName: string;
  complianceScorePct: number;
  status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'NON_CONFORMING';
  lastAuditedAt: string;
};

export type ESignatureSignoff = {
  id: string;
  documentRef: string;
  signerName: string;
  signerRole: string;
  verificationHash: string;
  signedAt: string;
};

const complianceRecordsStore: ComplianceAuditRecord[] = [
  { id: 'comp_1', framework: 'ISO_9001', auditName: 'Quality Management System Audit Q1 2026', complianceScorePct: 98.5, status: 'COMPLIANT', lastAuditedAt: new Date().toISOString() },
  { id: 'comp_2', framework: 'OSHA_SAFETY', auditName: 'Steel Mill Workplace Heat & Crane Safety Check', complianceScorePct: 96.0, status: 'COMPLIANT', lastAuditedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'comp_3', framework: 'FDA_21CFR11', auditName: 'Electronic Records & Signatures Compliance', complianceScorePct: 100.0, status: 'COMPLIANT', lastAuditedAt: new Date(Date.now() - 172800000).toISOString() },
];

const esignaturesStore: ESignatureSignoff[] = [
  { id: 'sig_1', documentRef: 'WO-2026-001 (Final QC Release)', signerName: 'Eng. Rahman', signerRole: 'Plant Quality Manager', verificationHash: 'sha256_e891209a882f', signedAt: new Date().toISOString() },
];

export async function getComplianceRecords() {
  return complianceRecordsStore;
}

export async function createESignatureSignoff(documentRef: string, signerName: string, signerRole: string) {
  const signoff: ESignatureSignoff = {
    id: `sig_${Date.now()}`,
    documentRef,
    signerName,
    signerRole,
    verificationHash: `sha256_${Math.random().toString(36).substring(2, 14)}`,
    signedAt: new Date().toISOString(),
  };
  esignaturesStore.unshift(signoff);
  return signoff;
}
