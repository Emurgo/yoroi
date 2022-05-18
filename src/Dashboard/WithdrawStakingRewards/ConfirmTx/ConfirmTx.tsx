import React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet'
import {Staked} from '../../StakePoolInfos'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  stakingInfo: Staked
  shouldDeregister: boolean
}

export const ConfirmTx: React.FC<Props> = ({onSuccess, onCancel, shouldDeregister, stakingInfo}) => {
  const wallet = useSelectedWallet()

  return wallet.isHW ? (
    <ConfirmTxWithHW
      stakingInfo={stakingInfo}
      shouldDeregister={shouldDeregister}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : wallet.isEasyConfirmationEnabled ? (
    <ConfirmTxWithOS
      stakingInfo={stakingInfo}
      shouldDeregister={shouldDeregister}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  ) : (
    <ConfirmTxWithPassword
      stakingInfo={stakingInfo}
      shouldDeregister={shouldDeregister}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  )
}
