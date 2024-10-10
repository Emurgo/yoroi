import {App} from '@yoroi/types'

export function toLoggerMetadata(metadata: App.Logger.Metadata): App.Logger.Metadata {
  return Object.keys(metadata).reduce((acc, key) => {
    let value = metadata[key]
    if (value instanceof Error) value = value.toString()

    return {...acc, [key]: value}
  }, {})
}
