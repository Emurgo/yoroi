import storage from '@react-native-async-storage/async-storage'
import * as React from 'react'

import {to4_9_0} from './4_9_0'

export const useMigrations = () => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const runMigrations = async () => {
      await to4_9_0(storage)

      setDone(true)
    }
    runMigrations()
  }, [])

  return done
}
