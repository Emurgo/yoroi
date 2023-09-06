import React from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithPasswordAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {useStrings} from '../../common/strings'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
  onCancel?: () => void
}

// TODO
export const ConfirmTxWithOS = ({wallet, onSuccess, unsignedTx}: Props) => {
  const strings = useStrings()

  const {signAndSubmitTx, isLoading} = useSignWithPasswordAndSubmitTx(
    {wallet}, //
    {submitTx: {onSuccess}},
  )

  // TODO
  return <></>
}
