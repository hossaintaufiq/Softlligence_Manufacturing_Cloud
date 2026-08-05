export type HaClusterNode = {
  nodeId: string;
  role: 'PRIMARY' | 'REPLICA_STANDBY';
  region: string;
  status: 'HEALTHY' | 'SYNCING' | 'FAILOVER';
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  dbPoolConnections: number;
};

export type BackupSnapshot = {
  snapshotId: string;
  snapshotName: string;
  sizeMb: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  createdAt: string;
};

const clusterNodesStore: HaClusterNode[] = [
  { nodeId: 'node-us-east-1a', role: 'PRIMARY', region: 'us-east-1', status: 'HEALTHY', cpuUtilizationPct: 24.5, memoryUtilizationPct: 42.1, dbPoolConnections: 18 },
  { nodeId: 'node-us-east-1b', role: 'REPLICA_STANDBY', region: 'us-east-1', status: 'HEALTHY', cpuUtilizationPct: 14.2, memoryUtilizationPct: 38.0, dbPoolConnections: 6 },
];

const snapshotStore: BackupSnapshot[] = [
  { snapshotId: 'snap_101', snapshotName: 'auto_daily_db_backup_2026_08_05.sql.gz', sizeMb: 142.8, status: 'COMPLETED', createdAt: new Date().toISOString() },
];

export async function getHaClusterHealth() {
  return {
    clusterStatus: 'HIGHLY_AVAILABLE',
    activePrimaryNode: 'node-us-east-1a',
    replicaCount: 1,
    nodes: clusterNodesStore,
  };
}

export async function triggerDrSnapshot() {
  const snapshot: BackupSnapshot = {
    snapshotId: `snap_${Date.now()}`,
    snapshotName: `manual_dr_snapshot_${Date.now()}.sql.gz`,
    sizeMb: 145.2,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  };
  snapshotStore.unshift(snapshot);
  return snapshot;
}
