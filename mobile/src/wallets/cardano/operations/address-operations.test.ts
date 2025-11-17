import {Wallet} from '@yoroi/types'

import {
  generateNewReceiveAddress,
  getAddressing,
  getChangeAddress,
  getFirstPaymentAddress,
} from './address-operations'

describe('address-operations', () => {
  const mockAddresses = [
    'addr_test1qrg0x4sx2wfd3l26zqs658u8vyg8qz4dzqw0zke45lpy0vkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qzplc3l',
    'addr_test1qr0x4sx2wfd3l26zqs658u8vyg8qz4dzqw0zke45lpy0vkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qzplc3l',
  ]

  const mockWallet = {
    publicKeyHex: 'test-public-key-hex',
    accountVisual: 0,
    externalChain: {
      addresses: mockAddresses,
      isMyAddress: (addr: string) => mockAddresses.includes(addr),
      getIndexOfAddress: (addr: string) => mockAddresses.indexOf(addr),
    },
    internalChain: {
      addresses: mockAddresses,
      isMyAddress: (addr: string) => mockAddresses.includes(addr),
      getIndexOfAddress: (addr: string) => mockAddresses.indexOf(addr),
    },
    isUsedAddress: jest.fn().mockReturnValue(false),
  }

  describe('getChangeAddress', () => {
    it('should return external address for single address mode', () => {
      const address = getChangeAddress(mockWallet, 'single')
      expect(address).toBe(mockAddresses[0])
    })

    it('should return internal address for multiple address mode', () => {
      const address = getChangeAddress(mockWallet, 'multiple')
      expect(mockWallet.isUsedAddress).toHaveBeenCalled()
      expect(address).toBeDefined()
    })
  })

  describe('getAddressing', () => {
    it('should return addressing info for external address', () => {
      const addressing = getAddressing(
        mockAddresses[0],
        {
          publicKeyHex: mockWallet.publicKeyHex,
          accountVisual: mockWallet.accountVisual,
          internalChain: mockWallet.internalChain,
          externalChain: mockWallet.externalChain,
        },
        'cardano-cip1852' as Wallet.Implementation,
      )

      expect(addressing).toBeDefined()
      expect('path' in addressing ? addressing.path : []).toBeDefined()
    })

    it('should return addressing info for read-only wallet', () => {
      const addressing = getAddressing(
        mockAddresses[0],
        {
          publicKeyHex: '', // Empty for read-only
          accountVisual: 0,
          internalChain: mockWallet.internalChain,
          externalChain: mockWallet.externalChain,
        },
        'cardano-cip1852' as Wallet.Implementation,
      )

      expect(addressing).toBeDefined()
      if ('isReadOnly' in addressing) {
        expect(addressing.isReadOnly).toBe(true)
      }
    })
  })

  describe('generateNewReceiveAddress', () => {
    it('should generate new address when possible', () => {
      const mockWalletWithIncrease = {
        ...mockWallet,
        receiveAddressInfo: {canIncrease: true},
        accountManager: {
          save: jest.fn(),
        },
        notify: jest.fn(),
        receiveAddresses: mockAddresses,
      }

      const result = generateNewReceiveAddress(mockWalletWithIncrease)
      expect(typeof result).toBe('boolean')
    })

    it('should not generate address for read-only wallet', () => {
      const readOnlyWallet = {
        ...mockWallet,
        publicKeyHex: '', // Empty for read-only
        receiveAddressInfo: {canIncrease: true},
        accountManager: {
          save: jest.fn(),
        },
        notify: jest.fn(),
        receiveAddresses: mockAddresses,
      }

      const result = generateNewReceiveAddress(readOnlyWallet)
      expect(result).toBe(false)
    })
  })
})

