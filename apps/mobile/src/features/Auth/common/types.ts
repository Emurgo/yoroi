import * as AuthHost from 'expo-local-authentication'

export type AuthSetting = 'pin' | 'os' | null

export type AuthWithHostConfig = {
  isReady: boolean
  isSupported: boolean
  isEnrolled: boolean
  canAuthWithHost: boolean
  methods: AuthHost.AuthenticationType[]
}
