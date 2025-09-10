import {useAuth} from '../context/AuthProvider'

// TODO: REVISIT -> useCanAuthWithHost
export const useIsAuthOsSupported = () => {
  const {
    authWithHostConfig: {isSupported, isEnrolled},
  } = useAuth()
  return isSupported && isEnrolled
}
