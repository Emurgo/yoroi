import {connectWallet} from './connector.js'

export const getWalletConnectorJS = (props: {
  iconUrl: string
  apiVersion: string
  walletName: string
  supportedExtensions: {cip: number}[]
  sessionId: string
}) => {
  return connectWallet(props)
}
