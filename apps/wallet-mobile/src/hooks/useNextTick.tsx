import * as React from 'react'
import {InteractionManager} from 'react-native'

/*
 * This hook is used to run a callback after animations and layout are done
 * it is useful a action is need but it requires the UI to be done, so it enques to the next tick
 */
export const useNextTick = (callback: () => void) => {
  React.useLayoutEffect(() => {
    InteractionManager.runAfterInteractions(() => setImmediate(callback))
  }, [callback])
}
