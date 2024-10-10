import {useQuery} from 'react-query'

import {getAddressType} from '../../../../yoroi-wallets/cardano/utils'

export const useAddressType = (address: string) => {
  const query = useQuery(['useAddressType', address], () => getAddressType(address), {
    suspense: true,
  })

  if (query.data === undefined) throw new Error('invalid address type')
  return query.data
}
