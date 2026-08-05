export type MachineWorkstation = {
  id: string;
  name: string;
  code: string;
  status: 'RUNNING' | 'IDLE' | 'DOWNTIME' | 'MAINTENANCE';
  oeeScorePct: number;
  currentWorkOrderNo?: string;
  downtimeMin: number;
  lastDowntimeReason?: string;
};

export type QmsInspectionItem = {
  id: string;
  inspectionNo: string;
  entityType: string;
  entityId: string;
  inspectorName: string;
  status: 'PASSED' | 'FAILED' | 'REJECTED' | 'CONDITIONAL';
  defectCount: number;
  remarks?: string;
  inspectedAt: string;
};

const machineStore: MachineWorkstation[] = [
  { id: 'm1', name: 'Induction Furnace #1 (15-Ton)', code: 'FURNACE-01', status: 'RUNNING', oeeScorePct: 92.4, currentWorkOrderNo: 'WO-2026-001', downtimeMin: 0 },
  { id: 'm2', name: 'Continuous Casting Machine (CCM-01)', code: 'CCM-01', status: 'RUNNING', oeeScorePct: 89.1, currentWorkOrderNo: 'WO-2026-001', downtimeMin: 15, lastDowntimeReason: 'Ladle nozzle change' },
  { id: 'm3', name: 'Steel Rolling Mill Stand #1', code: 'MILL-STAND-01', status: 'DOWNTIME', oeeScorePct: 76.5, currentWorkOrderNo: 'WO-2026-002', downtimeMin: 45, lastDowntimeReason: 'Motor thermal overload' },
  { id: 'm4', name: 'Rebar Shearing & Cooling Bed', code: 'COOL-BED-01', status: 'RUNNING', oeeScorePct: 94.8, currentWorkOrderNo: 'WO-2026-002', downtimeMin: 0 },
];

const qmsStore: QmsInspectionItem[] = [
  { id: 'qms_1', inspectionNo: 'QC-2026-089', entityType: 'steel_heat', entityId: 'HEAT-2026-001', inspectorName: 'Eng. Rahman', status: 'PASSED', defectCount: 0, remarks: 'Chemical composition & tensile test passed 500D spec.', inspectedAt: new Date().toISOString() },
  { id: 'qms_2', inspectionNo: 'QC-2026-090', entityType: 'rolling_batch', entityId: 'ROLL-2026-004', inspectorName: 'QC Lead Kabir', status: 'CONDITIONAL', defectCount: 2, remarks: 'Minor surface scale on 12mm bundle 4.', inspectedAt: new Date(Date.now() - 3600000).toISOString() },
];

export async function getMachines() {
  return machineStore;
}

export async function logMachineDowntime(machineId: string, downtimeMin: number, reason: string) {
  const machine = machineStore.find((m) => m.id === machineId);
  if (machine) {
    machine.status = 'DOWNTIME';
    machine.downtimeMin += downtimeMin;
    machine.lastDowntimeReason = reason;
  }
  return { success: true, machine };
}

export async function getQmsInspections() {
  return qmsStore;
}

export async function createQmsInspection(data: Omit<QmsInspectionItem, 'id' | 'inspectedAt'>) {
  const item: QmsInspectionItem = {
    id: `qms_${Date.now()}`,
    ...data,
    inspectedAt: new Date().toISOString(),
  };
  qmsStore.unshift(item);
  return item;
}
