import {useAuth} from '../context/AuthProvider'

export const useIsAuthOsSupported = () => {
  const {authWithHostConfig} = useAuth()
  return authWithHostConfig.isSupported && authWithHostConfig.isEnrolled
}
