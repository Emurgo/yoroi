import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {hasShownNetworkNoticeStorageKeyManager} from '~/kernel/storage/storages'

export const useHasShowNetworkNotice = () => {
  const [
    hasShownNetworkNotice,
    setHasShownNetworkNotice,
    resetHasShownNetworkNotice,
  ] = useSyncStorageToState(hasShownNetworkNoticeStorageKeyManager)

  return React.useMemo(
    () => ({
      hasShownNetworkNotice,
      setHasShownNetworkNotice,
      resetHasShownNetworkNotice,
    }),
    [
      hasShownNetworkNotice,
      setHasShownNetworkNotice,
      resetHasShownNetworkNotice,
    ],
  )
}
