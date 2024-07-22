import {SafeAreaView} from 'react-native-safe-area-context'
import {View} from 'react-native'
import {Button, Text} from '../../../components'
import * as React from 'react'
import {useConfirmRawTx as usePromptRootKey} from '../common/hooks'
import {useConfirmHWConnectionModal} from '../common/ConfirmHWConnectionModal'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {Transaction} from '@emurgo/cross-csl-core'
import {cip30LedgerExtensionMaker} from '../../../yoroi-wallets/cardano/cip30/cip30-ledger'
import {useShowHWNotSupportedModal} from '../common/HWNotSupportedModal'
import {useParams} from '../../../kernel/navigation'
import {z} from 'zod'
import {createTypeGuardFromSchema} from '@yoroi/common'
import {useEffect} from 'react'

export type ReviewTransactionParams = {
  cbor: string
  onConfirm: (rootKey: string) => void
  onCancel: () => void
}

const paramsSchema = z.object({
  cbor: z.string(),
  onConfirm: z.function(),
  onCancel: z.function(),
})

const isParams = createTypeGuardFromSchema(paramsSchema)

export const ReviewTransaction = () => {
  const params = useParams<ReviewTransactionParams>(isParams)
  const promptRootKey = useConnectorPromptRootKey()
  const signData = useConnectorPromptRootKey()

  const signTxWithHW = useSignTxWithHW()
  const signDataWithHW = useSignDataWithHW()

  const handleOnConfirm = async () => {
    const rootKey = await promptRootKey()
    params.onConfirm(rootKey)
  }

  useEffect(() => {
    return () => {
      console.log('ReviewTransaction unmounted')
      params.onCancel()
    }
  }, [])

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{backgroundColor: 'white', flex: 1}}>
      <View>
        <Text>Review Transaction</Text>
      </View>
      <Button title={'Confirm'} shelleyTheme onPress={handleOnConfirm} />
    </SafeAreaView>
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
