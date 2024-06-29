import {useAsyncStorage} from '@yoroi/common'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useOpenConfirmConnectionModal} from './common/ConfirmConnectionModal'
import {useOpenUnverifiedDappModal} from './common/UnverifiedDappModal'
import {useConfirmRawTx as usePromptRootKey} from './common/hooks'
import * as React from 'react'
import {InteractionManager} from 'react-native'
import {createDappConnector} from './common/helpers'
import {DappConnector} from '@yoroi/dapp-connector'
import {TransactionWitnessSet} from '@emurgo/cross-csl-core'
import {useConfirmHWConnection} from './common/ConfirmRawTxWithHW'
import {cip30LedgerExtensionMaker} from '../../yoroi-wallets/cardano/cip30/cip30-ledger'

export const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const {wallet, meta} = useSelectedWallet()

  const confirmConnection = useConfirmConnection()

  const signTx = useConnectorPromptRootKey()
  const signData = useConnectorPromptRootKey()

  const signTxWithHW = useSignTxWithHW()
  const signDataWithHW = useSignDataWithHW()

  return React.useMemo(
    () =>
      createDappConnector({
        appStorage,
        wallet,
        confirmConnection,
        signTx,
        signData,
        meta,
        signTxWithHW,
        signDataWithHW,
      }),
    [appStorage, wallet, confirmConnection, signTx, signData, meta, signTxWithHW, signDataWithHW],
  )
}

const useConnectorPromptRootKey = () => {
  const promptRootKey = usePromptRootKey()

  return React.useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      try {
        promptRootKey({
          onConfirm: (rootKey) => {
            resolve(rootKey)
            return Promise.resolve()
          },
          onClose: () => reject(new Error('User rejected')),
        })
      } catch (error) {
        reject(error)
      }
    })
  }, [promptRootKey])
}

const useSignTxWithHW = () => {
  const {confirmHWConnection} = useConfirmHWConnection()
  const {wallet, meta} = useSelectedWallet()

  return React.useCallback(
    (cbor: string, partial?: boolean) => {
      return new Promise<TransactionWitnessSet>((resolve, reject) => {
        try {
          confirmHWConnection({
            onConfirm: async (transportType) => {
              try {
                const deviceInfo = meta.hwDeviceInfo
                if (!deviceInfo) throw new Error('No device info')
                const cip30 = cip30LedgerExtensionMaker(wallet, meta)
                const witnessSet = await cip30.signTx(cbor, partial ?? false, deviceInfo, transportType === 'USB')
                return resolve(witnessSet)
              } catch (error) {
                reject(error)
              }
            },
            onClose: () => reject(new Error('User rejected')),
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    [confirmHWConnection, wallet, meta],
  )
}

const useSignDataWithHW = () => {
  const promptRootKey = usePromptRootKey()

  return React.useCallback(() => {
    return new Promise<{signature: string; key: string}>((resolve, reject) => {
      try {
        promptRootKey({
          onConfirm: (rootKey) => {
            resolve(rootKey)
            return Promise.resolve()
          },
          onClose: () => reject(new Error('User rejected')),
        })
      } catch (error) {
        reject(error)
      }
    })
  }, [promptRootKey])
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
