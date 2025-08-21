import {useRoute} from '@react-navigation/native'

export const useUnsafeParams = <Params>() => {
  const route = useRoute()

  return route?.params as unknown as Params
}
