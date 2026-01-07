import {
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'

import {useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {CardanoCardAnnouncementModal} from './CardanoCardAnnouncementModal'

const CARDANO_CARD_ANNOUNCEMENT_MODAL_SHOWN_KEY =
  'cardano-card-announcement-modal-shown'
const CARDANO_CARD_ANNOUNCEMENT_MODAL_OPEN_COUNT_KEY =
  'cardano-card-announcement-modal-open-count'
const CARDANO_CARD_ANNOUNCEMENT_MODAL_LAST_SHOWN_OPEN_COUNT_KEY =
  'cardano-card-announcement-modal-last-shown-open-count'
const QUERY_KEY = ['cardanoCardAnnouncementModalState']

type CardanoCardAnnouncementModalState = {
  openCount: number
  lastShownOpenCount: number
}

const INITIAL_STATE: CardanoCardAnnouncementModalState = Object.freeze({
  openCount: 0,
  lastShownOpenCount: 0,
})

const parseIntOr = (raw: string | null, defaultValue: number) => {
  if (raw == null) return defaultValue
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) return defaultValue
  return Math.max(0, parsed)
}

const parseLegacyShown = (legacyValue: boolean | string | null) => {
  if (legacyValue === true) return true
  if (legacyValue === false || legacyValue == null) return false

  const parsed = parseBoolean(legacyValue)
  if (parsed != null) return parsed

  if (legacyValue === 'true') return true
  if (legacyValue === 'false') return false

  return true
}

let hasIncrementedOpenCountThisSession = false

export const useCardanoCardAnnouncementModal = () => {
  const {config, isLoading: isLoadingConfig} = useRemoteConfig()
  const {openModal} = useModal()
  const strings = useStrings()
  const modalHeight = 600
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()
  const [isShowing, setIsShowing] = React.useState(true)
  const expectedOpenCountRef = React.useRef<number | null>(null)
  const setShowing = React.useCallback(
    (next: boolean) => setIsShowing((prev) => (prev === next ? prev : next)),
    [],
  )

  const cachedValue =
    queryClient.getQueryData<CardanoCardAnnouncementModalState>(QUERY_KEY)

  const stateQuery = useQuery({
    queryKey: QUERY_KEY,
    initialData: cachedValue,
    queryFn: async () => {
      try {
        const [openCountValue, lastShownOpenCountValue, legacyValue] =
          await Promise.all([
            storage.getItem<number | string | null>(
              CARDANO_CARD_ANNOUNCEMENT_MODAL_OPEN_COUNT_KEY,
            ),
            storage.getItem<number | string | null>(
              CARDANO_CARD_ANNOUNCEMENT_MODAL_LAST_SHOWN_OPEN_COUNT_KEY,
            ),
            storage.getItem<boolean | string | null>(
              CARDANO_CARD_ANNOUNCEMENT_MODAL_SHOWN_KEY,
            ),
          ])

        const openCount = parseIntOr(
          typeof openCountValue === 'number'
            ? String(openCountValue)
            : openCountValue,
          0,
        )
        const lastShownOpenCount = parseIntOr(
          typeof lastShownOpenCountValue === 'number'
            ? String(lastShownOpenCountValue)
            : lastShownOpenCountValue,
          0,
        )

        const legacyShown = parseLegacyShown(legacyValue)

        if (legacyShown) {
          return {
            openCount: Math.max(openCount, 1),
            lastShownOpenCount: Math.max(lastShownOpenCount, 1),
          }
        }

        return {openCount, lastShownOpenCount}
      } catch (_error) {
        return INITIAL_STATE
      }
    },
    placeholderData: INITIAL_STATE,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const incrementOpenCount = useMutationWithInvalidations({
    mutationFn: async () => {
      const [rawOpenCount, rawLastShownOpenCount] = await Promise.all([
        storage.getItem<number | string | null>(
          CARDANO_CARD_ANNOUNCEMENT_MODAL_OPEN_COUNT_KEY,
        ),
        storage.getItem<number | string | null>(
          CARDANO_CARD_ANNOUNCEMENT_MODAL_LAST_SHOWN_OPEN_COUNT_KEY,
        ),
      ])

      const currentOpenCount = parseIntOr(
        typeof rawOpenCount === 'number' ? String(rawOpenCount) : rawOpenCount,
        0,
      )
      const currentLastShownOpenCount = parseIntOr(
        typeof rawLastShownOpenCount === 'number'
          ? String(rawLastShownOpenCount)
          : rawLastShownOpenCount,
        0,
      )

      if (currentOpenCount >= 5 && currentLastShownOpenCount >= 5) {
        return {
          openCount: currentOpenCount,
          lastShownOpenCount: currentLastShownOpenCount,
        }
      }

      const nextOpenCount = currentOpenCount + 1
      await storage.setItem(
        CARDANO_CARD_ANNOUNCEMENT_MODAL_OPEN_COUNT_KEY,
        nextOpenCount,
      )

      return {
        openCount: nextOpenCount,
        lastShownOpenCount: currentLastShownOpenCount,
      }
    },
    invalidateQueries: [],
    onSuccess: (nextState) => {
      expectedOpenCountRef.current = null
      queryClient.setQueryData(QUERY_KEY, nextState)
    },
  })

  const setLastShownOpenCount = useMutationWithInvalidations({
    mutationFn: async (openCount: number) => {
      await Promise.all([
        storage.setItem(
          CARDANO_CARD_ANNOUNCEMENT_MODAL_LAST_SHOWN_OPEN_COUNT_KEY,
          openCount,
        ),
        storage.setItem(CARDANO_CARD_ANNOUNCEMENT_MODAL_SHOWN_KEY, true),
      ])

      return openCount
    },
    invalidateQueries: [],
    onSuccess: (openCount) => {
      const current =
        queryClient.getQueryData<CardanoCardAnnouncementModalState>(QUERY_KEY)

      queryClient.setQueryData<CardanoCardAnnouncementModalState>(QUERY_KEY, {
        openCount: Math.max(current?.openCount ?? 0, openCount),
        lastShownOpenCount: Math.max(
          current?.lastShownOpenCount ?? 0,
          openCount,
        ),
      })
    },
  })

  const state = stateQuery.data ?? INITIAL_STATE
  const hasTriggeredRef = React.useRef(false)
  const shouldDisplay =
    config?.popups?.cardanoCardAnnouncement?.display ?? false

  React.useEffect(() => {
    if (isLoadingConfig || !stateQuery.isSuccess) return
    if (config == null) return
    if (!shouldDisplay) return
    if (hasIncrementedOpenCountThisSession) return

    hasIncrementedOpenCountThisSession = true
    expectedOpenCountRef.current = state.openCount + 1
    incrementOpenCount.mutate()
  }, [
    isLoadingConfig,
    stateQuery.isSuccess,
    config,
    shouldDisplay,
    incrementOpenCount,
    state.openCount,
    state.lastShownOpenCount,
  ])

  React.useEffect(() => {
    if (isLoadingConfig || !stateQuery.isSuccess) return
    if (config == null) return

    if (!shouldDisplay) {
      if (!hasTriggeredRef.current) setShowing(false)
      return
    }

    const expectedOpenCount = expectedOpenCountRef.current
    if (
      expectedOpenCount != null &&
      !hasTriggeredRef.current &&
      state.openCount < expectedOpenCount
    ) {
      setShowing(true)
      return
    }

    const shouldShowNow =
      (state.openCount === 1 || state.openCount === 5) &&
      state.lastShownOpenCount !== state.openCount

    if (!shouldShowNow) {
      if (!hasTriggeredRef.current) setShowing(false)
      return
    }

    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    setShowing(true)
    setLastShownOpenCount.mutate(state.openCount)

    openModal({
      title: strings.staking.cardanoCardAnnouncementTitle,
      content: <CardanoCardAnnouncementModal.Content />,
      footer: <CardanoCardAnnouncementModal.Footer />,
      height: modalHeight,
      canDiscard: true,
      onClose: () => {
        setTimeout(() => {
          setShowing(false)
        }, 400)
      },
    })
  }, [
    stateQuery.isSuccess,
    isLoadingConfig,
    config,
    shouldDisplay,
    openModal,
    strings,
    modalHeight,
    setLastShownOpenCount,
    setShowing,
    state.openCount,
    state.lastShownOpenCount,
  ])

  return {isLoading: isLoadingConfig, isShowing}
}
