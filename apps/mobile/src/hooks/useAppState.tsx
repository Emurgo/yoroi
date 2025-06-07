import * as React from 'react'
import {AppState, AppStateStatus} from 'react-native'

export function useAppState({on, execute}: Props) {
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === on) execute()
    })

    return () => subscription.remove()
  }, [on, execute])
}

type Props = {
  on: AppStateStatus
  execute: () => void
}
