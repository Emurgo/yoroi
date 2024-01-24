import * as React from 'react'
import {ScrollView, ScrollViewProps} from 'react-native'

const ScrollViewContext = React.createContext<{current: ScrollView | null}>({current: null})

export const useScrollView = () => React.useContext(ScrollViewContext).current

export const ScrollableView = (props: ScrollViewProps) => {
  const scrollViewRef = React.useRef<ScrollView | null>(null)

  return (
    <ScrollViewContext.Provider value={scrollViewRef}>
      <ScrollView {...props} ref={scrollViewRef} />
    </ScrollViewContext.Provider>
  )
}
