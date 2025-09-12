import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {screenShareStorageKeyManager} from '~/kernel/storage/storages'

export const useScreenSharing = () => {
  const [
    isScreenSharingEnabled,
    setIsScreenSharingEnabled,
    resetIsScreenSharingEnabled,
  ] = useSyncStorageToState(screenShareStorageKeyManager)

  return React.useMemo(
    () => ({
      isScreenSharingEnabled,
      setIsScreenSharingEnabled,
      resetIsScreenSharingEnabled,
      toggleIsScreenSharingEnabled: () =>
        setIsScreenSharingEnabled(!isScreenSharingEnabled),
    }),
    [
      isScreenSharingEnabled,
      setIsScreenSharingEnabled,
      resetIsScreenSharingEnabled,
    ],
  )
}
