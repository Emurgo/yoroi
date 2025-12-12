import {App} from '@yoroi/types'

export const appApiMaker = ({
  baseUrl: _baseUrl,
  request: _request,
}: {
  baseUrl: string
  request?: unknown
}): Readonly<App.Api> => {
  return {} as const
}
