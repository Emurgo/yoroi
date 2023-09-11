import {UseMutationOptions} from 'react-query'
import {YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useMutationWithInvalidations} from '../../../yoroi-wallets/hooks'

export const useCancelOrderTx = (
  options?: UseMutationOptions<YoroiUnsignedTx, Error, {entry: YoroiEntry; datum: {hash: string}}>,
) => {
  const metadata = [{label: 'Yoroi-Swap', data: {msg: ['Yoroi: Cancel Order']}}] // TODO: Check msg with community standards
  const wallet = useSelectedWallet()

  const mutation = useMutationWithInvalidations({
    mutationFn: (data) => wallet.createUnsignedTx(data.entry, metadata, data.datum),
    invalidateQueries: ['useCancelOrderTx'],
    ...options,
  })
  return {
    createCancelOrderTx: mutation.mutate,
    ...mutation,
  }
}
