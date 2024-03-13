import {connectWallet} from './connector.js'
export {handleEvent} from './resolver'
export {connectionStorageMaker} from './storage'

type SupportedExtension = {
  cip: number
}

const supportedExtensions: SupportedExtension[] = [{cip: 95}]

export const getWalletConnectorJS = (props: {
  iconUrl: string
  apiVersion: string
  walletName: string
  sessionId: string
}) => {
  return connectWallet({...props, supportedExtensions})
}
