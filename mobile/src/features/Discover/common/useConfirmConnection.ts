import {DappConnector} from '@yoroi/dapp-connector'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useOpenConfirmConnectionModal} from './ConfirmConnectionModal'
import {useOpenUnverifiedDappModal} from './UnverifiedDappModal'
import {useInvalidateConnectedDapps} from './useDAppsConnected'
import {useDappList} from './useDappList'

export const useConfirmConnection = () => {
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()
  const {openUnverifiedDappModal} = useOpenUnverifiedDappModal()
  const invalidateConnectedDapps = useInvalidateConnectedDapps()
  const {data: dappList} = useDappList()

  return React.useCallback(
    async (origin: string, _manager: DappConnector) => {
      const recommendedDApps = dappList?.dapps || []
      const selectedDapp = recommendedDApps.find((dapp) =>
        dapp.origins.includes(origin),
      )

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
          const shouldOpenMainModalRef = {current: false}
          openUnverifiedDappModal({
            onClose: () => {
              if (shouldOpenMainModalRef.current) {
                openMainModal()
              } else {
                resolve(false)
              }
            },
            onConfirm: () => {
              shouldOpenMainModalRef.current = true
            },
          })
          return
        }

        openMainModal()
      })
    },
    [
      openConfirmConnectionModal,
      openUnverifiedDappModal,
      invalidateConnectedDapps,
      dappList?.dapps,
    ],
  )
}
