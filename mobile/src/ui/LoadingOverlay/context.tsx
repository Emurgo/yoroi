import {invalid} from '@yoroi/common'

import * as React from 'react'

import {LoadingOverlay} from './LoadingOverlay'

type LoadingOverlayContextType = {
  show: () => void
  hide: () => void
  setIsEmpty: (empty: boolean) => void
  setContent: (content: React.ReactNode) => void
  isLoading: boolean
  isEmpty: boolean
}

const LoadingOverlayContext = React.createContext<
  LoadingOverlayContextType | undefined
>(undefined)

export const useLoadingOverlay = () =>
  React.useContext(LoadingOverlayContext) ||
  invalid('useLoadingOverlay must be used within a LoadingOverlayProvider')

type LoadingOverlayProviderProps = React.PropsWithChildren<{
  debug?: boolean
}>

export const LoadingOverlayProvider = ({
  children,
  debug,
}: LoadingOverlayProviderProps) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isEmpty, setIsEmpty] = React.useState(false)
  const [overlayContent, setOverlayContent] =
    React.useState<React.ReactNode>(null)

  const value = React.useMemo(
    () => ({
      show: () => setIsLoading(true),
      hide: () => setIsLoading(false),
      setIsEmpty,
      setContent: setOverlayContent,
      isLoading,
      isEmpty,
    }),
    [isLoading, isEmpty],
  )

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      <LoadingOverlay
        isLoading={isLoading}
        isEmpty={isEmpty}
        debug={debug}
        content={overlayContent}
      />
    </LoadingOverlayContext.Provider>
  )
}
