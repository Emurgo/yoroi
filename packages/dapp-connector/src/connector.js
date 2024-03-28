/**
 * @typedef {Object} CardanoApi
 *
 * @Property {(...args: any[]) => Promise} getBalance Function to get balance.
 * @Property {(...args: any[]) => Promise} getChangeAddress Function to get change address.
 * @Property {(...args: any[]) => Promise} getNetworkId Function to get network ID.
 * @Property {(...args: any[]) => Promise} getRewardAddresses Function to get reward addresses.
 * @Property {(...args: any[]) => Promise} getUsedAddresses Function to get used addresses.
 */

/**
 * @typedef {Object} Context
 *
 * @Property {string} origin
 */

const initWallet = ({iconUrl, apiVersion, walletName, supportedExtensions, sessionId}) => {
  // https://github.com/facebook/hermes/issues/114
  // https://github.com/facebook/hermes/issues/612
  'babel plugin show source'
  if (typeof iconUrl !== 'string') throw new Error('iconUrl must be a string')
  if (typeof apiVersion !== 'string') throw new Error('apiVersion must be a string')
  if (typeof walletName !== 'string') throw new Error('walletName must be a string')
  if (!Array.isArray(supportedExtensions)) throw new Error('supportedExtensions must be an array')

  if (window.cardano && window.cardano[walletName]) return

  class CIP30Error extends Error {
    constructor(message, code) {
      super(message)
      this.code = code
      this.info = message
    }
  }

  /**
   * Sends a message to ReactNativeWebView or window.
   * @param {Object} data
   */
  const postMessage = (data) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
      return
    }
    window.postMessage(JSON.stringify(data))
  }
  const promisesMap = new Map()

  /**
   * Returns a random string used as a request identifier.
   *
   * @returns {string}
   */
  const getRandomId = () => Math.random().toString(36).substr(2, 9)

  /**
   * Calls external method and returns a promise that resolves when the method is executed.
   *
   * @param {string} method
   * @param {any[]} args
   * @param {{doNotWaitForResponse: boolean}} options
   * @returns {Promise<void>|Promise<unknown>}
   */
  const callExternalMethod = (method, args = undefined, options = {}) => {
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

  /**
   * @param {Error | Object} error
   * @returns {string}
   */
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
      promise.reject(normalizeError(error))
    } else {
      promise.resolve(result)
    }
  })

  /**
   * @returns {CardanoApi}
   */
  const createApi = (cardanoEnableResponse) => {
    if (!cardanoEnableResponse) {
      logMessage('User Rejected')
      throw new CIP30Error('User Rejected', -3)
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

  /**
   * @returns {Context}
   */
  const getContext = () => {
    return {origin: window.location.origin}
  }

  let enabling = false
  /**
   * @returns {Promise<boolean>}
   */
  const isEnabled = async () => {
    if (localStorage.getItem('yoroi-session-id') !== sessionId) {
      enabling = true
      logMessage('Account Change')
      throw new CIP30Error('Account Change', -4)
    }

    if (enabling) {
      return false
    }

    return await callExternalMethod('cardano_is_enabled')
  }

  /**
   * @returns {Promise<CardanoApi>}
   * @throws {CIP30Error}
   */
  const enable = async (...args) => {
    enabling = true
    localStorage.setItem('yoroi-session-id', sessionId)
    try {
      const response = await callExternalMethod('cardano_enable', args)
      return createApi(response)
    } catch (e) {
      enabling = false
      throw normalizeError(e)
    }
  }

  /**
   * @param {Error} error
   * @returns {CIP30Error}
   */
  const normalizeError = (error) => {
    if (error.message.toLowerCase().includes('user rejected')) {
      logMessage('User Rejected')
      return new CIP30Error('User Rejected', -3)
    }
    logMessage('Error:' + error.message)
    return new CIP30Error(error.message, -1)
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
