import {useEffect} from 'react'
import {AppState} from 'react-native'
import BackgroundTimer from 'react-native-background-timer'

type BackgroundTimeoutOptions = {
  onTimeout: () => void
  duration: number
}

export const useBackgroundTimeout = ({onTimeout, duration}: BackgroundTimeoutOptions) => {
  useEffect(() => {
    let timeout: number | undefined

    const subscription = AppState.addEventListener('change', (appStateStatus) => {
      if (appStateStatus === 'background') timeout = BackgroundTimer.setTimeout(onTimeout, duration)
      else if (appStateStatus === 'active') timeout && BackgroundTimer.clearTimeout(timeout)
    })

    return () => subscription?.remove()
  }, [duration, onTimeout])
}

type Props = BackgroundTimeoutOptions
export const BackgroundTimeout = (props: Props) => {
  useBackgroundTimeout(props)

  return null
}
