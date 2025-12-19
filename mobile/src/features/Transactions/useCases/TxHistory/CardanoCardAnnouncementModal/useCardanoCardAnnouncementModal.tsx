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
const QUERY_KEY = ['cardanoCardAnnouncementModalShown']

export const useCardanoCardAnnouncementModal = () => {
  const {config, isLoading: isLoadingConfig} = useRemoteConfig()
  const {openModal} = useModal()
  const strings = useStrings()
  const modalHeight = 600
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()

  const cachedValue = queryClient.getQueryData<boolean>(QUERY_KEY)

  const hasBeenShownQuery = useQuery({
    queryKey: QUERY_KEY,
    initialData: cachedValue,
    queryFn: async () => {
      try {
        const rawValue = await storage.getItem<string | null>(
          CARDANO_CARD_ANNOUNCEMENT_MODAL_SHOWN_KEY,
          (value) => value,
        )

        if (rawValue === null) {
          return false
        }

        const parsed = parseBoolean(rawValue)
        if (parsed !== undefined) {
          return parsed
        }

        if (rawValue === 'true') {
          return true
        }
        if (rawValue === 'false') {
          return false
        }

        return true
      } catch (error) {
        return true
      }
    },
    placeholderData: true,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const setModalShown = useMutationWithInvalidations({
    mutationFn: async () => {
      await storage.setItem(CARDANO_CARD_ANNOUNCEMENT_MODAL_SHOWN_KEY, true)
    },
    invalidateQueries: [],
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEY, true)
    },
  })

  const hasBeenShown = hasBeenShownQuery.data ?? false
  const hasTriggeredRef = React.useRef(false)
  const shouldDisplay =
    config?.popups?.cardanoCardAnnouncement?.display ?? false

  React.useEffect(() => {
    if (
      !hasBeenShownQuery.isSuccess ||
      hasBeenShown ||
      hasTriggeredRef.current ||
      isLoadingConfig ||
      !shouldDisplay
    ) {
      return
    }

    hasTriggeredRef.current = true

    queryClient.setQueryData(QUERY_KEY, true)

    setModalShown.mutate()

    openModal({
      title: strings.staking.cardanoCardAnnouncementTitle,
      content: <CardanoCardAnnouncementModal.Content />,
      footer: <CardanoCardAnnouncementModal.Footer />,
      height: modalHeight,
      canDiscard: true,
    })
  }, [
    hasBeenShownQuery.isSuccess,
    hasBeenShown,
    isLoadingConfig,
    shouldDisplay,
    openModal,
    strings,
    modalHeight,
    setModalShown,
    queryClient,
  ])

  return {isLoading: isLoadingConfig}
}
