// @flow

import React from 'react'
import {ScrollView} from 'react-native'
import type {Props} from 'react-native/Libraries/Components/ScrollView/ScrollView'

type ScrollViewRef = {+scrollTo: ({x?: number, y?: number, animated?: boolean}) => void}
const ScrollViewContext = React.createContext<{current: ScrollViewRef | null}>({current: null})

export const useScrollView = () => React.useContext(ScrollViewContext).current

export const ScrollableView = (props: Props) => {
  const scrollViewRef = React.useRef<ScrollViewRef | null>(null)

  return (
    <ScrollViewContext.Provider value={scrollViewRef}>
      <ScrollView {...props} ref={scrollViewRef} />
    </ScrollViewContext.Provider>
  )
}
