export type AppQueueTask = () => Promise<void>

export type AppQueueTaskManager = Readonly<{
  enqueue: (task: AppQueueTask) => void
  destroy: () => void
}>
