import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {TRANSACTION_DIRECTION, TRANSACTION_STATUS} from '@yoroi/types'

import {useTransactionSummaries} from './useTransactionSummaries'

export const useHasPendingTx = ({wallet}: {wallet: YoroiWallet}) => {
  const transactionSummaries = useTransactionSummaries({wallet})

  return Object.values(transactionSummaries).some(
    (transactionSummary) =>
      transactionSummary.status === TRANSACTION_STATUS.PENDING &&
      transactionSummary.direction !== TRANSACTION_DIRECTION.RECEIVED,
  )
}
