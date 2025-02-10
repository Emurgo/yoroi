import {DappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useOpenConfirmConnectionModal} from './ConfirmConnectionModal'
import {useOpenUnverifiedDappModal} from './UnverifiedDappModal'
import {useInvalidateConnectedDapps} from './useDAppsConnected'

export const useConfirmConnection = () => {
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()
  const {openUnverifiedDappModal, closeModal} = useOpenUnverifiedDappModal()
  const invalidateConnectedDapps = useInvalidateConnectedDapps()

  return React.useCallback(
    async (origin: string, manager: DappConnector) => {
      const recommendedDApps = await manager.getDAppList()
      const selectedDapp = recommendedDApps.dapps.find((dapp) => dapp.origins.includes(origin))
      const name = selectedDapp?.name ?? origin
      const website = origin
      const logo = selectedDapp?.logo ?? ''
      const showSingleAddressWarning = selectedDapp?.isSingleAddress ?? false

      return new Promise<boolean>((resolve) => {
        const openMainModal = () => {
          openConfirmConnectionModal({
            name,
            website,
            logo,
            onConfirm: () => {
              resolve(true)
              InteractionManager.runAfterInteractions(() => {
                invalidateConnectedDapps()
              })
            },
            onClose: () => resolve(false),
            showSingleAddressWarning,
          })
        }

        if (!selectedDapp) {
          let shouldResolveOnClose = true
          openUnverifiedDappModal({
            onClose: () => {
              if (shouldResolveOnClose) resolve(false)
            },
            onConfirm: () => {
              shouldResolveOnClose = false
              closeModal()
              InteractionManager.runAfterInteractions(() => {
                openMainModal()
              })
            },
          })
          return
        }

        openMainModal()
      })
    },
    [openConfirmConnectionModal, openUnverifiedDappModal, closeModal, invalidateConnectedDapps],
  )
}
