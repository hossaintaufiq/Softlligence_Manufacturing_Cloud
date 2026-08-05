export type BackgroundJob = {
  id: string;
  name: 'pdf.challan' | 'nightly.reconcile' | 'batch.import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  payload: Record<string, any>;
  createdAt: string;
  completedAt?: string;
};

const jobQueueStore: BackgroundJob[] = [
  {
    id: 'job_001',
    name: 'pdf.challan',
    status: 'completed',
    attempts: 1,
    payload: { challanNo: 'CHAL-2026-001', customer: 'National Builders' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
  },
  {
    id: 'job_002',
    name: 'nightly.reconcile',
    status: 'completed',
    attempts: 1,
    payload: { warehouseCount: 4, reconciledLots: 128 },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
  },
];

export async function enqueueBackgroundJob(name: BackgroundJob['name'], payload: Record<string, any>) {
  const job: BackgroundJob = {
    id: `job_${Date.now()}`,
    name,
    status: 'pending',
    attempts: 0,
    payload,
    createdAt: new Date().toISOString(),
  };

  jobQueueStore.unshift(job);

  // Asynchronously execute worker processing
  setTimeout(() => {
    job.status = 'processing';
    job.attempts += 1;
    setTimeout(() => {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      console.log(`[JOB QUEUE] Job ${job.id} (${job.name}) completed successfully.`);
    }, 1500);
  }, 500);

  return job;
}

export async function getBackgroundJobs() {
  return jobQueueStore;
}
