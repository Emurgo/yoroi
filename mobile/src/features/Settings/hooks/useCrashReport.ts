import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {crashReportsStorageKeyManager} from '~/kernel/storage/storages'

export const useCrashReport = () => {
  const [
    isCrashReportEnabled,
    setIsCrashReportEnabled,
    resetIsCrashReportEnabled,
  ] = useSyncStorageToState(crashReportsStorageKeyManager)

  return React.useMemo(
    () => ({
      isCrashReportEnabled,
      setIsCrashReportEnabled,
      resetIsCrashReportEnabled,
      toggleIsCrashReportEnabled: () =>
        setIsCrashReportEnabled(!isCrashReportEnabled),
    }),
    [isCrashReportEnabled, setIsCrashReportEnabled, resetIsCrashReportEnabled],
  )
}
