import {useAuth} from '../context/AuthProvider'

export const useAuthSetting = () => {
  const {authSetting} = useAuth()
  return authSetting
}
