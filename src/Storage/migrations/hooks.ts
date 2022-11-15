import storage from '@react-native-async-storage/async-storage'
import * as React from 'react'
import DeviceInfo from 'react-native-device-info'

import {Version, versionCompare} from '../../yoroi-wallets/utils/versioning'
import {to4_9_0} from './4_9_0'

export const useMigrations = () => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const runMigrations = async () => {
      const version = DeviceInfo.getVersion() as Version
      const before4_9_0 = versionCompare(version, '4.9.0') === -1

      // asc order
      // 4.9.0
      if (before4_9_0) await to4_9_0(storage)

      setDone(true)
    }
    runMigrations()
  }, [])

  return done
}
