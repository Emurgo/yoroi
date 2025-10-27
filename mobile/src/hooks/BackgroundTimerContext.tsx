import * as React from 'react'

/**
 * BackgroundTimerContext - Android-specific solution for permission dialog handling
 *
 * On Android, permission dialogs (e.g., Bluetooth, Location) send the app to background,
 * which can trigger auto-logout timers. This context allows temporarily disabling the
 * background timer while permission dialogs are active.
 *
 * On iOS, set `active={false}` to provide no-op functions, making the code seamlessly
 * cross-platform without explicit Platform checks at usage sites.
 */

type BackgroundTimerContextType = {
  isDisabled: boolean
  disable: () => void
  enable: () => void
}

const BackgroundTimerContext = React.createContext<
  BackgroundTimerContextType | undefined
>(undefined)

const NO_OP_VALUE: BackgroundTimerContextType = {
  isDisabled: false,
  disable: () => {},
  enable: () => {},
}

type BackgroundTimerProviderProps = React.PropsWithChildren<{
  active?: boolean
}>

export const BackgroundTimerProvider: React.FC<
  BackgroundTimerProviderProps
> = ({children, active = true}) => {
  const [isDisabled, setIsDisabled] = React.useState(false)
  const disableCountRef = React.useRef(0)

  const disable = React.useCallback(() => {
    if (!active) return
    disableCountRef.current += 1
    setIsDisabled(true)
  }, [active])

  const enable = React.useCallback(() => {
    if (!active) return
    disableCountRef.current = Math.max(0, disableCountRef.current - 1)
    if (disableCountRef.current === 0) {
      setIsDisabled(false)
    }
  }, [active])

  const value = React.useMemo(
    () => (active ? {isDisabled, disable, enable} : NO_OP_VALUE),
    [active, isDisabled, disable, enable],
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
