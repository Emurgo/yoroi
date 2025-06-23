import {linksCardanoModuleMaker} from '@yoroi/links'
import {Links, Scan} from '@yoroi/types'
import {freeze} from 'immer'

export const parseScanAction = (codeContent: string): Scan.Action => {
  const isPossibleLink = codeContent.includes(':')

  // NOTE: if it is a string < 256 with valid characters, it'd be consider a Yoroi Receiver (wallet address | domain name)
  if (!isPossibleLink) {
    if (codeContent.length > 255 || !nonProtocolRegex.test(codeContent)) throw new Scan.Errors.UnknownContent()
    return freeze({
      action: 'send-only-receiver',
      receiver: codeContent,
    } as const)
  }

  if (isOpenableLink(codeContent)) {
    return freeze({
      action: 'launch-url',
      url: codeContent,
    } as const)
  }

  const cardanoLinks = linksCardanoModuleMaker()
  const parsedCardanoLink = cardanoLinks.parse(codeContent)

  if (parsedCardanoLink === undefined) throw new Links.Errors.SchemeNotImplemented()

  if (parsedCardanoLink.config.authority === 'claim') {
    const {faucet_url: url, code, ...params} = parsedCardanoLink.params
    return freeze(
      {
        action: 'claim',
        url,
        code,
        params,
      } as const,
      true,
    )
  }

  const {address: receiver, amount, memo, message} = parsedCardanoLink.params
  return freeze(
    {
      action: 'send-single-pt',
      receiver,
      params: {
        amount,
        memo,
        message,
      },
    } as const,
    true,
  )
}

const nonProtocolRegex = /^[a-zA-Z0-9_\-.$]+$/
const isOpenableLink = (content: string) => {
  return content.startsWith('yoroi') || content.startsWith('https')
}
