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

  const setValues = async (values: string[]) => {
    await storage.setItem('processed', values)
  }

  const includes = async (value: string) => {
    const processed = await getValues()
    return processed.includes(value)
  }

  const clear = async () => {
    await storage.setItem('processed', [])
  }

  const isEmpty = async () => {
    const processed = await getValues()
    return processed.length === 0
  }

  return {
    getValues,
    addValues,
    includes,
    clear,
    setValues,
    isEmpty,
  }
}
