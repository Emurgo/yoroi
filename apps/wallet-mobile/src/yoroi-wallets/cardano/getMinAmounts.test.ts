import {Balance} from '@yoroi/types'

import {protocolParamsPlaceholder} from '../../features/WalletManager/network-manager/network-manager'
import {mocks as walletMocks} from '../mocks'
import {getMinAmounts, withMinAmounts, withPrimaryToken} from './getMinAmounts'

describe('withMinAmounts()', () => {
  it('should return the min amount quantity', async () => {
    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '123',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }

    expect(
      await withMinAmounts(address, amounts, walletMocks.wallet.portfolioPrimaryTokenInfo, protocolParamsPlaceholder),
    ).toEqual({
      '.': '1301620',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    })
  })

  it('should return the input amount quantity', async () => {
    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '1234432556466',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }

    expect(
      await withMinAmounts(address, amounts, walletMocks.wallet.portfolioPrimaryTokenInfo, protocolParamsPlaceholder),
    ).toEqual(amounts)
  })
})

describe('withPrimaryToken()', () => {
  it('should return the input amounts', () => {
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '123',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }

    expect(withPrimaryToken(amounts, walletMocks.wallet.portfolioPrimaryTokenInfo)).toEqual(amounts)
  })

  it('should return the input amounts plus primary token as 0', () => {
    const amounts: Balance.Amounts = {
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }

    expect(withPrimaryToken(amounts, walletMocks.wallet.portfolioPrimaryTokenInfo)).toEqual({
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '0',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    })
  })
})

describe('getMinAmounts()', () => {
  it('should return the min amount', async () => {
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '123',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }
    const address =
      'addr_test1qrrdv3uxj8shu27ea9djvnn3rl4w3lvh3cyck6yc36mvf6ctlqxj9g0azvpycncr9u600p6t556qhc3psk06uzzw6saq4kvdpq'

    expect(
      await getMinAmounts(address, amounts, walletMocks.wallet.portfolioPrimaryTokenInfo, protocolParamsPlaceholder),
    ).toEqual({
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '1301620',
    })
  })

  it('should throw an error', async () => {
    const amounts: Balance.Amounts = {
      [walletMocks.wallet.portfolioPrimaryTokenInfo.id]: '123',
      '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950': '12',
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '55',
    }

    const address = 'really-bad-address'

    const primaryToken = walletMocks.wallet.portfolioPrimaryTokenInfo

    await expect(getMinAmounts(address, amounts, primaryToken, protocolParamsPlaceholder)).rejects.toEqual(
      new Error('getMinAmounts::Error not a valid address'),
    )
  })
})
