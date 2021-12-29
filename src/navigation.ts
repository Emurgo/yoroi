import {useRoute} from '@react-navigation/native'

export const useParams = <Params>(guard: Guard<Params>): Params => {
  const params = useRoute().params

  if (!guard(params)) {
    throw new Error(`useParams: guard failed: ${JSON.stringify(params, null, 2)}`)
  }

  return params
}

type Guard<Params> = (params?: Params | object | undefined) => params is Params
