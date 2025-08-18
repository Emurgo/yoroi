import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {privacyModeStorageKeyManager} from '~/kernel/storage/storages'

export const usePrivacyMode = () => {
  const [privacyMode, setPrivacyMode] = useSyncStorageToState(
    privacyModeStorageKeyManager,
  )

  return React.useMemo(
    () => ({
      isPrivacyActive: privacyMode,
      privacyMode,
      togglePrivacyMode: () => setPrivacyMode(!privacyMode),
      setPrivacyModeOff: () => setPrivacyMode(false),
      setPrivacyModeOn: () => setPrivacyMode(true),
      privacyPlaceholder,
    }),
    [privacyMode, setPrivacyMode],
  )
}

export const privacyPlaceholder = '******'
