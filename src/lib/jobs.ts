export type JobResult = {
  ok: boolean;
  checked?: number;
  changed?: number;
  provider?: string;
  message?: string;
};

export async function runCronJob(name: string, handler: () => Promise<JobResult>) {
  const startedAt = Date.now();
  try {
    const result = await handler();
    return { name, durationMs: Date.now() - startedAt, ...result };
  } catch (error) {
    return {
      name,
      ok: false,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : 'unknown job error'
    };
  }
}
