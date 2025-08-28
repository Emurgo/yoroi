import {useRoute} from '@react-navigation/native'

import {Guard} from '../types'

export const useParams = <Params>(guard: Guard<Params>): Params => {
  const params = useRoute().params

  if (!params || !guard(params)) {
    throw new Error(
      `useParams: guard failed: ${JSON.stringify(params, null, 2)}`,
    )
  }

  return params
}
