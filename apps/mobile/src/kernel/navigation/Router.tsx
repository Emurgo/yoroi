import {NavigationContainer} from '@react-navigation/native'
import * as React from 'react'

function RouterContainer({children}: React.PropsWithChildren) {
  return <NavigationContainer>{children}</NavigationContainer>
}

export {RouterContainer}
