import {HeartbeatMessage, WalletRequest, WalletResponse} from '../types'
import {
  createTextMessage,
  createWalletRequest,
  isHeartbeatMessage,
  isWalletRequest,
  isWalletResponse,
  parseWalletMessage,
} from './message-utils'

describe('message-utils', () => {
  describe('createWalletRequest', () => {
    it('should create a wallet request with method and data', () => {
      const request = createWalletRequest('signTx', {amount: '100'})

      expect(request.type).toBe('request')
      expect(request.method).toBe('signTx')
      expect(request.data).toEqual({amount: '100'})
      expect(typeof request.id).toBe('number')
    })

    it('should create a wallet request with null data when not provided', () => {
      const request = createWalletRequest('signTx')

      expect(request.type).toBe('request')
      expect(request.method).toBe('signTx')
      expect(request.data).toBeNull()
    })
  })

  describe('createTextMessage', () => {
    it('should create a text message', () => {
      const message = createTextMessage('Hello')

      expect(message.message).toBe('Hello')
    })
  })

  describe('parseWalletMessage', () => {
    it('should parse a JSON string message', () => {
      const jsonString = JSON.stringify({
        type: 'request',
        method: 'signTx',
        id: 123,
      })
      const message = parseWalletMessage(jsonString)

      expect(message.type).toBe('request')
      expect((message as {method: string}).method).toBe('signTx')
    })

    it('should return object as-is if already parsed', () => {
      const messageObj = {type: 'request', method: 'signTx', id: 123}
      const message = parseWalletMessage(messageObj)

      expect(message).toEqual(messageObj)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => parseWalletMessage('invalid json')).toThrow(
        'Invalid message format',
      )
    })
  })

  describe('isWalletRequest', () => {
    it('should return true for wallet request', () => {
      const request: WalletRequest = {
        type: 'request',
        method: 'signTx',
        id: 123,
      }
      expect(isWalletRequest(request)).toBe(true)
    })

    it('should return false for non-request messages', () => {
      const response: WalletResponse = {
        type: 'response',
        method: 'signTx',
        id: 123,
      }
      expect(isWalletRequest(response)).toBe(false)
    })
  })

  describe('isWalletResponse', () => {
    it('should return true for wallet response', () => {
      const response: WalletResponse = {
        type: 'response',
        method: 'signTx',
        id: 123,
      }
      expect(isWalletResponse(response)).toBe(true)
    })

    it('should return false for non-response messages', () => {
      const request: WalletRequest = {
        type: 'request',
        method: 'signTx',
        id: 123,
      }
      expect(isWalletResponse(request)).toBe(false)
    })
  })

  describe('isHeartbeatMessage', () => {
    it('should return true for heartbeat message', () => {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        action: 'ping',
        timestamp: 123456,
      }
      expect(isHeartbeatMessage(heartbeat)).toBe(true)
    })

    it('should return false for non-heartbeat messages', () => {
      const request: WalletRequest = {
        type: 'request',
        method: 'signTx',
        id: 123,
      }
      expect(isHeartbeatMessage(request)).toBe(false)
    })
  })
})
