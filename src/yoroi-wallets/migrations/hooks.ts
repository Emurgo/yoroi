import * as React from 'react'

import {YoroiStorage} from '../storage'
import {to4_9_0} from './4_9_0'

export const useMigrations = (storage: YoroiStorage) => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const runMigrations = async () => {
      await to4_9_0(storage)

      setDone(true)
    }
    runMigrations()
  }, [storage])

  return done
}
