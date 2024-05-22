import {LoggerMetadata} from '../types'

export function toLoggerMetadata(metadata: LoggerMetadata): LoggerMetadata {
  return Object.keys(metadata).reduce((acc, key) => {
    let value = metadata[key]
    if (value instanceof Error) value = value.toString()

    return {...acc, [key]: value}
  }, {})
}
