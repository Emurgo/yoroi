import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {WebView, WebViewMessageEvent} from 'react-native-webview'
import {useEffect} from 'react'
import {Logger} from '../../../yoroi-wallets/logging'
// @ts-ignore
import {connectWallet} from './connector'
import {isKeyOf} from '@yoroi/common'

export const useConnectWalletToWebView = (wallet: YoroiWallet, webView: WebView | null) => {
  const sendMessageToWebView = (id: number, result: unknown, error?: Error) => {
    console.log('sending data to webview', {id, result, error: error?.message || null})
    // TODO: check if webView.postMessage() works
    webView?.injectJavaScript(getInjectableMessage({id, result, error: error?.message || null}))
  }

  const handleEvent = (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    try {
      const {id, method, params} = JSON.parse(data)
      handleMethod(method, params)
        .then((result) => method !== 'log_message' && sendMessageToWebView(id, result))
        .catch((error) => method !== 'log_message' && sendMessageToWebView(id, null, error))
    } catch (e) {
      Logger.error('DappExplorer', 'handleEvent::error', e)
    }
  }

  useEffect(() => {
    console.log('connecting')
    console.log(getInitScript())
    webView?.injectJavaScript(getInitScript())
  }, [wallet, webView])

  return {handleEvent, initScript: getInitScript()}
}

const getInjectableMessage = (message: unknown) => {
  return `(() => window.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(message)}})))()`
}

const resolver = {
  logMessage: (params: unknown, context: unknown) => console.log('Log From WebView:', params),
  isEnabled: (params: unknown, context: unknown) => false,
  api: {
    getBalance: (params: unknown, context: unknown) => '1a062ea8a0',
    getChangeAddresses: (params: unknown, context: unknown) => [
      '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ],
    getNetworkId: (params: unknown, context: unknown) => 1,
    getRewardAddresses: (params: unknown, context: unknown) => [
      'e184d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ],
    getUsedAddresses: (params: unknown, context: unknown) => [
      '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ],
  },
} as const

const handleMethod = async (method: string, params: unknown) => {
  if (method === 'cardano_enable') {
    // ASK user to confirm connection depending on params and website origin
    return true
  }

  if (method === 'cardano_is_enabled') {
    return resolver.isEnabled(params, null)
  }

  if (method === 'log_message') {
    resolver.logMessage(params, null)
    return true
  }

  if (method.startsWith('api.')) {
    const methodParts = method.split('.')
    if (methodParts.length !== 2) throw new Error(`Invalid method ${method}`)
    const apiMethod = methodParts[1]
    if (!isKeyOf(apiMethod, resolver.api)) throw new Error(`Unknown method ${method}`)
    return resolver.api[apiMethod](params, null)
  }

  console.log('unknown method', method, params)
  throw new Error(`Unknown method '${method}' with params ${JSON.stringify(params)}`)
}

const WALLET_NAME = 'yoroi'
const API_VERSION = '0.3.0'
const ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNjMiIHZpZXdCb3g9IjAgMCA3MiA2MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExODRfODQyNDApIj4KPHBhdGggZD0iTTU1LjYyNzEgNDguOTEzNkw0OS45MjEgNTIuODcxMkw3LjkwMjMyIDIzLjg2MjNDNy45MDIzMiAyMy44MDU2IDcuOTAyMzIgMjMuNzQ4OCA3Ljg4NTYgMjMuNjkyVjIxLjEwMzdDNy44ODU2IDIwLjI2NDMgNy44ODU2IDE5LjQyNjEgNy44ODU2IDE4LjU4ODlWMTUuOTUzOUw1NS42MjcxIDQ4LjkxMzZaTTQzLjkwMDYgMTEuNDc1M0M0MS4zNjM1IDEzLjIxMTkgMzguODAyOSAxNC45MTUyIDM2LjI2NTggMTYuNjUxOUMzNi4xMzk2IDE2Ljc2NjYgMzUuOTc1MSAxNi44MzAyIDM1LjgwNDQgMTYuODMwMkMzNS42MzM4IDE2LjgzMDIgMzUuNDY5MyAxNi43NjY2IDM1LjM0MzEgMTYuNjUxOUMzMi4yMDc2IDE0LjQ3MSAyOS4wNTU0IDEyLjMxMDIgMjUuOTE2NSAxMC4xNDYxQzIyLjYxMzkgNy44NTUwMyAxOS4zMTM0IDUuNTU3MyAxNi4wMTUyIDMuMjUyODlMMTEuMzMyIDBIMEMwLjYwMTY5OSAwLjQyMDgwNSAxLjA5NjQzIDAuNzc0ODE2IDEuNTk0NSAxLjExODgxTDEwLjQ3NjMgNy4yNzA1OEMxMy40MDQ1IDkuMzA1NTkgMTYuMzMxNyAxMS4zNDA2IDE5LjI1NzcgMTMuMzc1NkMyMi4wMTIyIDE1LjI4OTMgMjQuNzU5OSAxNy4yMTI5IDI3LjUxNzcgMTkuMTIzM0MzMC4xMzUxIDIwLjkzNjcgMzIuNzU5MiAyMi43MzAyIDM1LjM3NjYgMjQuNTQ3QzM1LjQ4MjMgMjQuNjQyNyAzNS42MTk5IDI0LjY5NTggMzUuNzYyNyAyNC42OTU4QzM1LjkwNTQgMjQuNjk1OCAzNi4wNDMgMjQuNjQyNyAzNi4xNDg4IDI0LjU0N0MzOC4yNjE0IDIzLjEwMDkgNDAuMzk3NCAyMS42NzgyIDQyLjUgMjAuMjMyMUM0Ny43MzI2IDE2LjY0OTYgNTIuOTYwNyAxMy4wNjE3IDU4LjE4NDMgOS40NjgxMkw2OS42MDMyIDEuNjY5ODZDNzAuMzkyMSAxLjEzMjE3IDcxLjE3NzcgMC41ODQ0NTIgNzIgMEg2MC42MzQ2QzU1LjA1NDQgMy44MjI4NyA0OS40NzY0IDcuNjQ3OTcgNDMuOTAwNiAxMS40NzUzWk03Ljk0NTc3IDM1LjI0NzRDNy45MjA5NyAzNS4yOTU1IDcuOTAwODIgMzUuMzQ1OCA3Ljg4NTYgMzUuMzk3N1Y0MC4xNTM1QzcuODg1NiA0MS4xMDIgNy44ODU2IDQyLjA1MDUgNy44ODU2IDQyLjk5NTZDNy44ODgxNCA0My4wNTMzIDcuOTAxNzYgNDMuMTEgNy45MjU3MiA0My4xNjI2TDM1Ljk3MTYgNjIuNTMzSDM1Ljk5ODNMNDEuNzA0NCA1OC41Nzg4TDcuOTQ1NzcgMzUuMjQ3NFpNNjMuOTc0IDE1Ljk3MDZMNDMuMTAxNyAzMC4zOTE1QzQzLjE2NzYgMzAuNDgwNCA0My4yNDE1IDMwLjU2MzEgNDMuMzIyMyAzMC42Mzg2QzQ1LjA4NzMgMzEuODg3NyA0Ni44NTM0IDMzLjEzMTIgNDguNjIwNiAzNC4zNjkxQzQ4LjY3ODkgMzQuNDAwNCA0OC43NDU3IDM0LjQxMjEgNDguODExMiAzNC40MDI1TDYzLjkyMzkgMjMuOTQ5MkM2My45NDY2IDIzLjkwNDggNjMuOTYzNCAyMy44NTc2IDYzLjk3NCAyMy44MDg5VjE1Ljk3MDZaTTYzLjk5MDcgMzUuNTUxNEM2MS42MjA3IDM3LjE4NDUgNTkuMzM0MiAzOC43NjQyIDU3LjAyMSA0MC4zNjM5TDYyLjQ0MyA0NC4yMDQ2TDYzLjk5MDcgNDMuMTMyNVYzNS41NTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExODRfODQyNDApIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTg0Xzg0MjQwIiB4MT0iOS4xNTU4NiIgeTE9IjQ0LjM4NDkiIHgyPSI2Mi43NDE3IiB5Mj0iLTkuMjQ5ODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzFBNDRCNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTg0Xzg0MjQwIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjYyLjUyNjMiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=='
const SUPPORTED_EXTENSIONS = [{cip: 95}]

const getInitScript = () => {
  return getWalletConnectorJS({
    iconUrl: ICON_URL,
    apiVersion: API_VERSION,
    walletName: WALLET_NAME,
    supportedExtensions: SUPPORTED_EXTENSIONS,
  })
}

const getWalletConnectorJS = (props: {
  iconUrl: string
  apiVersion: string
  walletName: string
  supportedExtensions: {cip: number}[]
}) => {
  return connectWallet(props)
  // return `(${connectWallet.toString()})(${JSON.stringify({iconUrl, apiVersion, walletName, supportedExtensions})})`
}
