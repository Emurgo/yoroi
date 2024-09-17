export class LocalizableError extends Error {
  id: string
  defaultMessage: string
  values: Record<string, unknown>

  constructor({
    id,
    defaultMessage,
    values = {},
  }: {
    id: string
    defaultMessage: string
    values?: Record<string, unknown>
  }) {
    if (!id) throw new Error('id:string is required.')
    if (!defaultMessage) throw new Error('defaultMessage:string is required.')
    super(`${id}: ${JSON.stringify(values)}`)
    this.id = id
    this.defaultMessage = defaultMessage
    this.values = values ?? {}
  }
}
