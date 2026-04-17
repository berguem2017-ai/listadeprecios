import { Queue } from "bullmq"

const connection = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
}

export const excelQueue = new Queue("excel-import", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})

export interface ExcelImportJob {
  supplierId: string
  userId: string
  fileUrl: string
  fileName: string
  updateLogId: string
}

export async function enqueueExcelImport(data: ExcelImportJob) {
  return excelQueue.add("process-excel", data, {
    jobId: `excel-${data.updateLogId}`,
  })
}
