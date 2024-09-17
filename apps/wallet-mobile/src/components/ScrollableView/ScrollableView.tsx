import * as React from 'react'
import {ScrollView} from 'react-native'

const ScrollViewContext = React.createContext<{current: ScrollView | null}>({current: null})

export const useScrollView = () => React.useContext(ScrollViewContext).current
