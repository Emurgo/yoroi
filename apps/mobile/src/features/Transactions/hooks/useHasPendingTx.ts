import {YoroiWallet} from '~/wallets/cardano/types'
import {TRANSACTION_DIRECTION, TRANSACTION_STATUS} from '~/wallets/types/other'
import {useTransactionInfos} from './useTransactionInfos'

export const useHasPendingTx = ({wallet}: {wallet: YoroiWallet}) => {
  const transactionInfos = useTransactionInfos({wallet})

  return Object.values(transactionInfos).some(
    (transactionInfo) =>
      transactionInfo.status === TRANSACTION_STATUS.PENDING &&
      transactionInfo.direction !== TRANSACTION_DIRECTION.RECEIVED,
  )
}
