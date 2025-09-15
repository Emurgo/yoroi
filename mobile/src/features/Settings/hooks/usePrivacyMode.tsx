import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {privacyModeEnabledStorageKeyManager} from '~/kernel/storage/storages'

export const privacyPlaceholder = '******'

export const usePrivacyMode = () => {
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useSyncStorageToState(
    privacyModeEnabledStorageKeyManager,
  )

  return React.useMemo(
    () => ({
      isPrivacyModeEnabled,
      toggleIsPrivacyModeEnabled: () =>
        setIsPrivacyModeEnabled(!isPrivacyModeEnabled),
      privacyPlaceholder,
    }),
    [isPrivacyModeEnabled, setIsPrivacyModeEnabled],
  )
}
