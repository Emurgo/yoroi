export const mockUseScreenShareSettingEnabled = () => ({
  data: false,
})

export const mockUseAuthSetting = () => 'os'
//
// export const mockUseCrashReports = () => {
//   const set = useSetCrashReportsEnabled()
//
//   return {
//     enabled: mockUseCrashReportsEnabled(),
//     enable: React.useCallback(() => set(true), [set]),
//     disable: React.useCallback(() => set(false), [set]),
//   }
// }

export const mockUseCurrencyPairing = () => 'USD'

export const mockIsAuthOsSupported = () => false

export const mockUseAuthWithOs = ({onSuccess}: {onSuccess: () => void}) => ({
  authWithOs: () => {
    onSuccess: () => {
      onSuccess()
    }
  },
})
