// import {Amounts} from '../../../yoroi-wallets/utils'

import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'

// const secondaryTokenId = '698a6ea0ca99f315034072af31eaac6ec11fe8558d3f48e9775aab9d.7444524950'
// const secondaryAmount = Amounts.getAmount(walletMocks.balances, secondaryTokenId)
// const primaryAmount = Amounts.getAmount(walletMocks.balances, walletMocks.wallet.primaryTokenInfo.id)

export const mocks = {
  editingAmount: {
    adding: {
      // selectedTokenFromId: secondaryTokenId,
      selectedTokenFromId: walletMocks.wallet.primaryTokenInfo.id,
    },
  },
}
