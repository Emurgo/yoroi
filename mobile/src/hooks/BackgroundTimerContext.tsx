import * as React from 'react'

/**
 * BackgroundTimerContext - Android-specific solution for permission dialog handling
 *
 * On Android, permission dialogs (e.g., Bluetooth, Location) send the app to background,
 * which can trigger auto-logout timers. This context allows temporarily disabling the
 * background timer while permission dialogs are active.
 *
 * On iOS, this provider is not mounted and hooks return no-op functions, making the
 * code seamlessly cross-platform without explicit Platform checks at usage sites.
 */

type BackgroundTimerContextType = {
  isDisabled: boolean
  disable: () => void
  enable: () => void
}

const BackgroundTimerContext = React.createContext<
  BackgroundTimerContextType | undefined
>(undefined)

export const BackgroundTimerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isDisabled, setIsDisabled] = React.useState(false)
  const disableCountRef = React.useRef(0)

  const disable = React.useCallback(() => {
    disableCountRef.current += 1
    setIsDisabled(true)
  }, [])

  const enable = React.useCallback(() => {
    disableCountRef.current = Math.max(0, disableCountRef.current - 1)
    if (disableCountRef.current === 0) {
      setIsDisabled(false)
    }
  }, [])

  const value = React.useMemo(
    () => ({isDisabled, disable, enable}),
    [isDisabled, disable, enable],
  )

  return (
    <BackgroundTimerContext.Provider value={value}>
      {children}
    </BackgroundTimerContext.Provider>
  )
}

export const useBackgroundTimerControl = () => {
  const context = React.useContext(BackgroundTimerContext)

  // If no provider exists (e.g., on iOS), return no-op functions
  // This allows the code to work seamlessly across platforms
  if (!context) {
    return {
      isDisabled: false,
      disable: () => {},
      enable: () => {},
    }
  }

  return context
}

export const useBackgroundTimerState = () => {
  const context = React.useContext(BackgroundTimerContext)
  // If no provider exists, assume timer is enabled
  return context?.isDisabled ?? false
}
