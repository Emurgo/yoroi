import {useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions} from 'react-query'

import {RawUtxo} from '../../types'
import {YoroiWallet} from '../types'

export const useSetCollateralId = (
  wallet: YoroiWallet,
  {...options}: UseMutationOptions<void, Error, RawUtxo['utxo_id']> = {},
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: (collateralId: RawUtxo['utxo_id']) => wallet.setCollateralId(collateralId),
    invalidateQueries: [['useSetCollateralId', wallet.id]],
    ...options,
  })

  return {
    ...mutation,
    setCollateralId: mutation.mutate,
  }
}
