/* eslint-disable @typescript-eslint/ban-ts-comment */

import {Balance} from '@yoroi/types'

import {mocks as walletMocks} from '../mocks'
import {CardanoMobile} from '../wallets'
import {getMinAmounts, withMinAmounts, withPrimaryToken} from './getMinAmounts'
import {cardanoValueFromMultiToken, normalizeToAddress} from './utils'

jest.mock('../wallets', () => ({
  CardanoMobile: {
    BigNum: {
      fromStr: jest.fn(),
    },
    TransactionOutput: {
      new: jest.fn(),
    },
    DataCost: {
      newCoinsPerByte: jest.fn(),
    },
    minAdaForOutput: jest.fn(),
  },
}))

jest.mock('./utils', () => ({
  cardanoValueFromMultiToken: jest.fn(),
  normalizeToAddress: jest.fn(),
}))

describe('withMinAmounts()', () => {
  beforeEach(jest.resetAllMocks)

  it('should returns the min amount quantity', async () => {
    const MOCKED_MIN_AMOUNT = '28282828'
    const MOCKED_INPUT_AMOUNT = '123'

    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.primaryToken.identifier]: MOCKED_INPUT_AMOUNT,
      fakeToken1: '123',
      fakeToken2: '123',
    }

    // @ts-ignore
    normalizeToAddress.mockResolvedValue({address: 'address'})
    // @ts-ignore
    CardanoMobile.minAdaForOutput.mockResolvedValue({toStr: jest.fn().mockReturnValue(MOCKED_MIN_AMOUNT)})
    // @ts-ignore
    cardanoValueFromMultiToken.mockResolvedValue('fake-value')

    expect(await withMinAmounts(address, amounts, walletMocks.wallet.primaryToken)).toEqual({
      '': MOCKED_MIN_AMOUNT,
      fakeToken1: '123',
      fakeToken2: '123',
    })
  })

  it('should returns the input amount quantity', async () => {
    const MOCKED_MIN_AMOUNT = '123'
    const MOCKED_INPUT_AMOUNT = '28282828'

    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.primaryToken.identifier]: MOCKED_INPUT_AMOUNT,
      fakeToken1: '123',
      fakeToken2: '123',
    }

    // @ts-ignore
    normalizeToAddress.mockResolvedValue({address: 'address'})
    // @ts-ignore
    CardanoMobile.minAdaForOutput.mockResolvedValue({toStr: jest.fn().mockReturnValue(MOCKED_MIN_AMOUNT)})
    // @ts-ignore
    cardanoValueFromMultiToken.mockResolvedValue('fake-value')

    expect(await withMinAmounts(address, amounts, walletMocks.wallet.primaryToken)).toEqual({
      '': MOCKED_INPUT_AMOUNT,
      fakeToken1: '123',
      fakeToken2: '123',
    })
  })
})

describe('withPrimaryToken()', () => {
  it('should returns the input amounts', () => {
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.primaryToken.identifier]: '1234',
      fakeToken1: '123',
      fakeToken2: '123',
    }

    expect(withPrimaryToken(amounts, walletMocks.wallet.primaryToken)).toEqual(amounts)
  })

  it('should returns the input amounts plus primary token as 0', () => {
    const amounts: Balance.Amounts = {
      fakeToken1: '123',
      fakeToken2: '123',
    }

    expect(withPrimaryToken(amounts, walletMocks.wallet.primaryToken)).toEqual({
      [walletMocks.wallet.primaryToken.identifier]: '0',
      fakeToken1: '123',
      fakeToken2: '123',
    })
  })
})

describe('getMinAmounts()', () => {
  beforeEach(jest.resetAllMocks)

  it('should return the mocked min amount', async () => {
    const MOCKED_MIN_AMOUNT_RESULT = '123'
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.primaryToken.identifier]: '321',
    }
    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'

    // @ts-ignore
    normalizeToAddress.mockResolvedValue({address: 'address'})
    // @ts-ignore
    CardanoMobile.minAdaForOutput.mockResolvedValue({toStr: jest.fn().mockReturnValue(MOCKED_MIN_AMOUNT_RESULT)})
    // @ts-ignore
    cardanoValueFromMultiToken.mockResolvedValue('fake-value')

    expect(await getMinAmounts(address, amounts, walletMocks.wallet.primaryToken)).toEqual({
      [walletMocks.wallet.primaryToken.identifier]: MOCKED_MIN_AMOUNT_RESULT,
    })
  })

  it('should throw an error', async () => {
    // @ts-ignore
    normalizeToAddress.mockResolvedValue(undefined)

    const amounts: Balance.Amounts = {
      [walletMocks.wallet.primaryToken.identifier]: '321',
    }

    const address = 'really-bad-address' // normalizeToAddress is mocked so this string does nothing

    const primaryToken = walletMocks.wallet.primaryToken

    await expect(getMinAmounts(address, amounts, primaryToken)).rejects.toEqual(
      new Error('getMinAmounts::Error not a valid address'),
    )
  })
})
