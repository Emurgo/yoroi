import {App} from '@yoroi/types'

export const buildProcessedNotificationsStorage = (storage: App.Storage) => {
  const getValues = async () => {
    return (await storage.getItem<string[]>('processed')) || []
  }

  const addValues = async (values: string[]) => {
    const processed = await getValues()
    const newProcessed = [...processed, ...values]
    await storage.setItem('processed', newProcessed)
  }

  const includes = async (value: string) => {
    const processed = await getValues()
    return processed.includes(value)
  }

  const clear = async () => {
    await storage.setItem('processed', [])
  }

  return {
    getValues,
    addValues,
    includes,
    clear,
  }
}
