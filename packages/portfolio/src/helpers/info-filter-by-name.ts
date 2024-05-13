import {Portfolio} from '@yoroi/types'

export function infoFilterByName(search: string) {
  if (search.length === 0) return () => true

  const searchSanitized = search.toLocaleLowerCase()

  return ({ticker, name}: Portfolio.Token.Info) =>
    ticker.toLocaleLowerCase().includes(searchSanitized) ||
    name.toLocaleLowerCase().includes(searchSanitized)
}
