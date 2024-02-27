/* eslint-disable */

export const connectWallet = (props) => {
  return `(${connectWallet2.toString()})(${JSON.stringify(props)})`
}

const connectWallet2 = ({iconUrl, apiVersion, walletName, supportedExtensions, sessionId}) => {
  // https://github.com/facebook/hermes/issues/114
  // https://github.com/facebook/hermes/issues/612
  'show source please'
  if (typeof iconUrl !== 'string') throw new Error('iconUrl must be a string')
  if (typeof apiVersion !== 'string') throw new Error('apiVersion must be a string')
  if (typeof walletName !== 'string') throw new Error('walletName must be a string')
  if (!Array.isArray(supportedExtensions)) throw new Error('supportedExtensions must be an array')

  const postMessage = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data))
  const promisesMap = new Map()

  const callExternalMethod = (method, params) => {
    const requestId = Math.random().toString(36).substr(2, 9) // id needs to be unique
    const promise = new Promise((resolve, reject) => {
      promisesMap.set(requestId, {resolve, reject})
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
    // callExternalMethod('log_message', 'Unhandled error:' + serializeError(event.error))
  })

  window.addEventListener('unhandledrejection', (event) => {
    // callExternalMethod('log_message', 'Unhandled rejection:' + serializeError(event.reason))
  })

  window.addEventListener('message', (event) => {
    // alert('got message' + JSON.stringify(event.data))
    // callExternalMethod('log_message', 'GOT EVENT' + JSON.stringify(event.data))
    const {id, result, error} = event.data
    const promise = promisesMap.get(id)
    // if (!promise) alert('promise not found' + id)
    if (promise) {
      // alert('promise found' + id + JSON.stringify(event.data))
      promisesMap.delete(id)
      if (error) {
        // callExternalMethod('log_message', 'WebView received error:' + JSON.stringify(error))
        promise.reject(handleError(error))
      } else {
        // callExternalMethod('log_message', 'WebView received response:' + JSON.stringify(result))
        promise.resolve(result)
      }
    }
  })

  const createApi = (cardanoEnableResponse) => {
    callExternalMethod('log_message', 'cardanoEnableResponse:' + JSON.stringify(cardanoEnableResponse))
    if (!cardanoEnableResponse) {
      alert('not enabled wallet')
      throw {code: -3, info: 'User Rejected'}
    }
    localStorage.setItem('yoroi-session-id', sessionId)

    enabling = false
    return {
      getBalance: (...args) => callExternalMethod('api.getBalance', {args, browserContext: getContext()}),
      getChangeAddress: (...args) => callExternalMethod('api.getChangeAddress', {args, browserContext: getContext()}),
      getNetworkId: (...args) => callExternalMethod('api.getNetworkId', {args, browserContext: getContext()}),
      getRewardAddresses: (...args) =>
        callExternalMethod('api.getRewardAddresses', {args, browserContext: getContext()}),
      getUsedAddresses: (...args) => callExternalMethod('api.getUsedAddresses', {args, browserContext: getContext()}),
    }
  }

  const getContext = () => {
    return {
      origin: window.location.origin,
    }
  }

  let enabling = false
  const isEnabled = () => {
    if (localStorage.getItem('yoroi-session-id') !== sessionId) {
      enabling = true
      throw {code: -4, info: 'Account Change'}
    }

    if (enabling) {
      return false
    }

    return callExternalMethod('cardano_is_enabled', {browserContext: getContext()})
  }

  const enable = () => {
    enabling = true
    localStorage.setItem('yoroi-session-id', sessionId)
    return callExternalMethod('cardano_enable', {browserContext: getContext()})
      .then(createApi)
      .catch((e) => handleError(e))
  }

  const handleError = (error) => {
    if (error.message.toLowerCase().includes('user rejected')) {
      return {code: -3, info: 'User Rejected'}
    }
    return {code: -1, info: error.message}
  }

  const walletObj = Object.freeze({
    enable,
    isEnabled,
    icon: iconUrl,
    apiVersion: apiVersion,
    name: walletName,
    supportedExtensions: Object.freeze(supportedExtensions),
  })

  window.cardano = window.cardano || {}
  window.cardano[walletName] = walletObj
}
