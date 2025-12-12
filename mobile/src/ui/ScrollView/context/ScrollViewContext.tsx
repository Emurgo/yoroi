import {invalid} from '@yoroi/common'

import * as React from 'react'
import {ScrollView} from 'react-native'

type ScrollViewContextValue = {
  scrollViewRef: React.RefObject<ScrollView | null>
  isScrollBarShown: boolean
  setIsScrollBarShown: (isShown: boolean) => void
}

export const ScrollViewContext =
  React.createContext<ScrollViewContextValue | null>(null)

export const ScrollViewProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isScrollBarShown, setIsScrollBarShown] = React.useState(false)
  const scrollViewRef = React.useRef<ScrollView | null>(null)

  const value: ScrollViewContextValue = {
    scrollViewRef,
    isScrollBarShown,
    setIsScrollBarShown,
  }

  return (
    <ScrollViewContext.Provider value={value}>
      {children}
    </ScrollViewContext.Provider>
  )
}

export const useScrollViewContext = () =>
  React.useContext(ScrollViewContext) ??
  invalid('useScrollViewContext must be used within a ScrollViewProvider')
