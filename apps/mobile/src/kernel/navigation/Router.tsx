import {NavigationContainer} from '@react-navigation/native'

function RouterContainer({children}: React.PropsWithChildren) {
  return <NavigationContainer>{children}</NavigationContainer>
}

export {RouterContainer}
