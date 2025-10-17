import * as React from 'react'

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
  if (!context) {
    throw new Error(
      'useBackgroundTimerControl must be used within BackgroundTimerProvider',
    )
  }
  return context
}

export const useBackgroundTimerState = () => {
  const context = React.useContext(BackgroundTimerContext)
  // If no provider exists, assume timer is enabled
  return context?.isDisabled ?? false
}
