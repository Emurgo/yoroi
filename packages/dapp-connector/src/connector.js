const initWallet = ({iconUrl, apiVersion, walletName, supportedExtensions, sessionId}) => {
  // https://github.com/facebook/hermes/issues/114
  // https://github.com/facebook/hermes/issues/612
  'babel plugin show source'
  if (typeof iconUrl !== 'string') throw new Error('iconUrl must be a string')
  if (typeof apiVersion !== 'string') throw new Error('apiVersion must be a string')
  if (typeof walletName !== 'string') throw new Error('walletName must be a string')
  if (!Array.isArray(supportedExtensions)) throw new Error('supportedExtensions must be an array')

  if (window.cardano && window.cardano[walletName]) return

  const postMessage = (data) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
      return
    }
    window.postMessage(JSON.stringify(data))
  }
  const promisesMap = new Map()

  const getRandomId = () => Math.random().toString(36).substr(2, 9)

  const callExternalMethod = (method, args, options = {}) => {
    const requestId = getRandomId()

    if (options?.doNotWaitForResponse) {
      postMessage({id: requestId, method, params: {args, browserContext: getContext()}})
      return Promise.resolve()
    }
    const promise = new Promise((resolve, reject) => {
      promisesMap.set(requestId, {resolve, reject})
    })
    const params = {args, browserContext: getContext()}
    postMessage({id: requestId, method, params})
    return promise
  }

  const logMessage = (...args) => {
    callExternalMethod('log_message', ['[yoroi-mobile-connector]:', ...args], {doNotWaitForResponse: true})
  }

  window.addEventListener('error', (event) => {
    logMessage('Unhandled error:' + serializeError(event.error))
  })

  window.addEventListener('unhandledrejection', (event) => {
    logMessage('Unhandled rejection:' + serializeError(event.reason))
  })

  const serializeError = (error) => {
    if (error instanceof Error) {
      return error.name + ': ' + error.message
    }
    return JSON.stringify(error)
  }

  window.addEventListener('message', (event) => {
    logMessage('Received message' + JSON.stringify(event.data))
    const {id, result, error} = event.data
    const promise = promisesMap.get(id)
    if (!promise) return
    promisesMap.delete(id)
    if (error) {
      promise.reject(handleError(error))
    } else {
      promise.resolve(result)
    }
  })

  const createApi = (cardanoEnableResponse) => {
    if (!cardanoEnableResponse) {
      logMessage('User Rejected')
      throw {code: -3, info: 'User Rejected'}
    }
    localStorage.setItem('yoroi-session-id', sessionId)

    enabling = false
    return {
      getBalance: (...args) => callExternalMethod('api.getBalance', args),
      getChangeAddress: (...args) => callExternalMethod('api.getChangeAddress', args),
      getNetworkId: (...args) => callExternalMethod('api.getNetworkId', args),
      getRewardAddresses: (...args) => callExternalMethod('api.getRewardAddresses', args),
      getUsedAddresses: (...args) => callExternalMethod('api.getUsedAddresses', args),
    }
  }

  const getContext = () => {
    return {origin: window.location.origin}
  }

  let enabling = false
  const isEnabled = () => {
    if (localStorage.getItem('yoroi-session-id') !== sessionId) {
      enabling = true
      logMessage('Account Change')
      throw {code: -4, info: 'Account Change'}
    }

    if (enabling) {
      return false
    }

    return callExternalMethod('cardano_is_enabled')
  }

  const enable = (...args) => {
    enabling = true
    localStorage.setItem('yoroi-session-id', sessionId)
    return callExternalMethod('cardano_enable', args).then(createApi).catch(handleError)
  }

  const handleError = (error) => {
    if (error.message.toLowerCase().includes('user rejected')) {
      logMessage('User Rejected')
      return {code: -3, info: 'User Rejected'}
    }
    logMessage('Error:' + error.message)
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

  window.cardano = window.cardano ?? {}
  window.cardano[walletName] = walletObj

  logMessage('Wallet connected')
}

const connectWalletBody = initWallet.toString()

export const connectWallet = (props) => {
  return `(${connectWalletBody})(${JSON.stringify(props)})`
}
