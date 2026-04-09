import * as React from 'react'
import {MMKV} from 'react-native-mmkv'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'

const storage = new MMKV({id: 'secondfi-teaser'})
const TEASER_DISMISSED_KEY = 'secondfi-teaser-dismissed'

type UseTeaserModalOptions = {
  enabled?: boolean
}

export const useTeaserModal = (options?: UseTeaserModalOptions) => {
  const enabled = options?.enabled ?? true
  const {config, isLoading: isLoadingConfig} = useRemoteConfig()
  const [hasDismissed, setHasDismissed] = React.useState<boolean>(() => {
    return storage.getBoolean(TEASER_DISMISSED_KEY) ?? false
  })
  const [isOpen, setIsOpen] = React.useState(false)
  const hasTriggeredRef = React.useRef(false)

  // Check if teaser is enabled in remote config (default: false)
  const isEnabledInConfig = config?.popups?.secondFiTeaser?.display ?? false

  const markAsDismissed = React.useCallback(() => {
    storage.set(TEASER_DISMISSED_KEY, true)
    setHasDismissed(true)
  }, [])

  const openTeaser = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeTeaser = React.useCallback(() => {
    setIsOpen(false)
    markAsDismissed()
  }, [markAsDismissed])

  // Auto-show teaser if:
  // 1. Hook is enabled (no other modals showing)
  // 2. Remote config is loaded
  // 3. Feature is enabled in remote config
  // 4. User hasn't dismissed it
  // 5. Haven't already triggered this session
  React.useEffect(() => {
    if (!enabled || isLoadingConfig || hasTriggeredRef.current) {
      return
    }

    if (!isEnabledInConfig) {
      return
    }

    if (hasDismissed) {
      return
    }

    // Small delay to avoid showing immediately on app launch
    const timer = setTimeout(() => {
      hasTriggeredRef.current = true
      openTeaser()
    }, 500)

    return () => clearTimeout(timer)
  }, [enabled, isLoadingConfig, isEnabledInConfig, hasDismissed, openTeaser])

  return {
    isOpen,
    closeTeaser,
  }
}
