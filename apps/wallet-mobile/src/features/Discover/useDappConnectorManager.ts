import {Transaction} from '@emurgo/cross-csl-core'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {InteractionManager} from 'react-native'

import {cip30LedgerExtensionMaker} from '../../yoroi-wallets/cardano/cip30/cip30-ledger'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useOpenConfirmConnectionModal} from './common/ConfirmConnectionModal'
import {useConfirmHWConnectionModal} from './common/ConfirmHWConnectionModal'
import {createDappConnector} from './common/helpers'
import {useConfirmRawTx as usePromptRootKey} from './common/hooks'
import {useShowHWNotSupportedModal} from './common/HWNotSupportedModal'
import {useOpenUnverifiedDappModal} from './common/UnverifiedDappModal'
import {useNavigateTo} from './common/useNavigateTo'

export const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()

  const confirmConnection = useConfirmConnection()

  const signData = useConnectorPromptRootKey()

  const signTxWithHW = useSignTxWithHW()
  const signDataWithHW = useSignDataWithHW()

  return React.useMemo(
    () =>
      createDappConnector({
        appStorage,
        wallet,
        confirmConnection,
        signTx: (cbor) => {
          return new Promise<string>((resolve, reject) => {
            let shouldResolve = true
            navigateTo.reviewTransaction({
              cbor,
              isHW: false,
              onConfirm: (rootKey) => {
                if (!shouldResolve) return
                shouldResolve = false
                resolve(rootKey)
                navigateTo.browseDapp()
              },
              onCancel: () => {
                if (!shouldResolve) return
                shouldResolve = false
                reject(new Error('User rejected'))
              },
            })
          })
        },
        signData,
        meta,
        signTxWithHW: (cbor, partial) => {
          return new Promise<Transaction>((resolve, reject) => {
            let shouldResolve = true
            navigateTo.reviewTransaction({
              cbor,
              partial,
              isHW: true,
              onConfirm: (tx) => {
                if (!shouldResolve) return
                shouldResolve = false
                resolve(tx)
                navigateTo.browseDapp()
              },
              onCancel: () => {
                if (!shouldResolve) return
                shouldResolve = false
                reject(new Error('User rejected'))
              },
            })
          })
        },
        signDataWithHW,
      }),
    [appStorage, wallet, confirmConnection, signData, meta, signTxWithHW, signDataWithHW],
  )
}

const useConnectorPromptRootKey = () => {
  const promptRootKey = usePromptRootKey()

  return React.useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      let shouldResolveOnClose = true

      try {
        promptRootKey({
          onConfirm: (rootKey) => {
            resolve(rootKey)
            shouldResolveOnClose = false
            return Promise.resolve()
          },
          onClose: () => {
            if (shouldResolveOnClose) reject(new Error('User rejected'))
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }, [promptRootKey])
}

const useSignTxWithHW = () => {
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  return React.useCallback(
    (cbor: string, partial?: boolean) => {
      return new Promise<Transaction>((resolve, reject) => {
        let shouldResolveOnClose = true
        confirmHWConnection({
          onConfirm: async ({transportType, deviceInfo}) => {
            try {
              const cip30 = cip30LedgerExtensionMaker(wallet, meta)
              const tx = await cip30.signTx(cbor, partial ?? false, deviceInfo, transportType === 'USB')
              shouldResolveOnClose = false
              return resolve(tx)
            } catch (error) {
              reject(error)
            } finally {
              closeModal()
            }
          },
          onClose: () => {
            if (shouldResolveOnClose) reject(new Error('User rejected'))
          },
        })
      })
    },
    [confirmHWConnection, wallet, meta, closeModal],
  )
}

const useSignDataWithHW = () => {
  const {showHWNotSupportedModal, closeModal} = useShowHWNotSupportedModal()

  return React.useCallback(() => {
    return new Promise<{signature: string; key: string}>((_resolve, reject) => {
      let shouldResolveOnClose = true
      showHWNotSupportedModal({
        onConfirm: () => {
          closeModal()
          shouldResolveOnClose = false
          return reject(new Error('User rejected'))
        },
        onClose: () => {
          if (shouldResolveOnClose) reject(new Error('User rejected'))
        },
      })
    })
  }, [showHWNotSupportedModal, closeModal])
}

const useConfirmConnection = () => {
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()
  const {openUnverifiedDappModal, closeModal} = useOpenUnverifiedDappModal()
  return React.useCallback(
    async (origin: string, manager: DappConnector) => {
      const recommendedDApps = await manager.getDAppList()
      const selectedDapp = recommendedDApps.dapps.find((dapp) => dapp.origins.includes(origin))

      return new Promise<boolean>((resolve) => {
        const openMainModal = () => {
          openConfirmConnectionModal({
            name: selectedDapp?.name ?? origin,
            website: origin,
            logo: selectedDapp?.logo ?? '',
            onConfirm: () => resolve(true),
            onClose: () => resolve(false),
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
    [openConfirmConnectionModal, openUnverifiedDappModal, closeModal],
  )
}
