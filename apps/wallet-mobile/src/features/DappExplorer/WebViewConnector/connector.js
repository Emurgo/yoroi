export const connectWallet = (props) => {
  return `(${connectWallet2.toString()})(${JSON.stringify(props)})`
}

const connectWallet2 = ({iconUrl, apiVersion, walletName, supportedExtensions}) => {
  // https://github.com/facebook/hermes/issues/114
  'show source'
  if (typeof iconUrl !== 'string') throw new Error('iconUrl must be a string')
  if (typeof apiVersion !== 'string') throw new Error('apiVersion must be a string')
  if (typeof walletName !== 'string') throw new Error('walletName must be a string')
  if (!Array.isArray(supportedExtensions)) throw new Error('supportedExtensions must be an array')

  const postMessage = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data))
  const promisesMap = new Map()
  let id = 0

  const callExternalMethod = (method, params) => {
    const requestId = id
    id++
    const promise = new Promise((resolve, reject) => {
      if (method !== 'log_message') {
        promisesMap.set(requestId, {resolve, reject})
      }
    })
    postMessage({id: requestId, method, params})
    return promise
  }

  const serializeError = (error) => {
    if (error instanceof Error) {
      return error.name + ': ' + error.message
    }
    return JSON.stringify(error)
  }

  window.addEventListener('error', (event) => {
    callExternalMethod('log_message', 'Unhandled error:' + serializeError(event.error))
  })

  window.addEventListener('unhandledrejection', (event) => {
    callExternalMethod('log_message', 'Unhandled rejection:' + serializeError(event.reason))
  })

  window.addEventListener('message', (event) => {
    callExternalMethod('log_message', 'GOT EVENT' + JSON.stringify(event.data))
    const {id, result, error} = event.data
    const promise = promisesMap.get(id)
    if (promise) {
      promisesMap.delete(id)
      if (error) {
        callExternalMethod('log_message', 'WebView received error:' + JSON.stringify(error))
        promise.reject(error)
      } else {
        callExternalMethod('log_message', 'WebView received response:' + JSON.stringify(result))
        promise.resolve(result)
      }
    }
  })

  const createApi = (cardanoEnableResponse) => {
    return {
      getBalance: (...args) => callExternalMethod('api.getBalance', {args}),
      getChangeAddress: (...args) => callExternalMethod('api.getChangeAddress', {args}),
      getNetworkId: (...args) => callExternalMethod('api.getNetworkId', {args}),
      getRewardAddresses: (...args) => callExternalMethod('api.getRewardAddresses', {args}),
      getUsedAddresses: (...args) => callExternalMethod('api.getUsedAddresses', {args}),
    }
  }

  const walletObj = Object.freeze({
    enable: () => callExternalMethod('cardano_enable').then(createApi),
    isEnabled: () => callExternalMethod('cardano_is_enabled'),
    icon: iconUrl,
    apiVersion: apiVersion,
    name: walletName,
    supportedExtensions: Object.freeze(supportedExtensions),
  })

  window.cardano = window.cardano || {}
  window.cardano[walletName] = walletObj
}
