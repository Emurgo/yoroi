import {Datum} from '@emurgo/yoroi-lib'
import React from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {ConfirmWithSpendingPassword} from '../../common/ConfirmWithSpendingPassword'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  datum: Datum
  onSuccess: () => void
  onCancel?: () => void
}

export const ConfirmTxWithPassword = ({wallet, onSuccess, unsignedTx, datum}: Props) => {
  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  return (
    <ConfirmWithSpendingPassword
      onSubmit={(password) => signAndSubmitTx({unsignedTx, password, datum})}
      isLoading={isLoading}
    />
  )
}
