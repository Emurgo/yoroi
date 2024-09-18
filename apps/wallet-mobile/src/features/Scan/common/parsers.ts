import {linksCardanoModuleMaker} from '@yoroi/links'
import {Links, Scan} from '@yoroi/types'

export const parseScanAction = (codeContent: string): Scan.Action => {
  const isLink = codeContent.includes(':')

  // NOTE: if it is a string < 256 with valid characters, it'd be consider a Yoroi Receiver (wallet address | domain name)
  if (!isLink) {
    if (codeContent.length > 255 || !nonProtocolRegex.test(codeContent)) throw new Scan.Errors.UnknownContent()
    return {
      action: 'send-only-receiver',
      receiver: codeContent,
    }
  }

  const cardanoLinks = linksCardanoModuleMaker()
  const parsedCardanoLink = cardanoLinks.parse(codeContent)

  if (parsedCardanoLink === undefined) throw new Links.Errors.SchemeNotImplemented()

  if (parsedCardanoLink.config.authority === 'claim') {
    const {faucet_url: url, code, ...params} = parsedCardanoLink.params
    return {
      action: 'claim',
      url,
      code,
      params,
    } as const
  }

  const {address: receiver, amount, memo, message} = parsedCardanoLink.params
  return {
    action: 'send-single-pt',
    receiver,
    params: {
      amount,
      memo,
      message,
    },
  } as const
}

const nonProtocolRegex = /^[a-zA-Z0-9_\-.$]+$/
