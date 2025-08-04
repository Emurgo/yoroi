import {supportedPrefixes} from '@yoroi/links'

import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import * as React from 'react'

const prefixes = [...supportedPrefixes]
const navRef =
  React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>()

export function RouterContainer({children}: React.PropsWithChildren) {
  return (
    <NavigationContainer ref={navRef} linking={{enabled: true, prefixes}}>
      {children}
    </NavigationContainer>
  )
}
