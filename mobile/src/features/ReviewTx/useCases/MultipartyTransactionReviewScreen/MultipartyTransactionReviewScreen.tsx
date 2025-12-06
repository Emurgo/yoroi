/**
 * Multiparty Transaction Review Screen
 * Shows transaction details with signer status for multiparty transactions
 * Reuses the regular ReviewTx component with multiparty props
 */
import {type ChainId, constructMultipartyTransactionJSON} from '@yoroi/tx'
import {Bip32PublicKeyHex, TransactionCborHex} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Alert} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {
  ReviewTxMemoProvider,
  useReviewTxMemo,
} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {FormattedTx, TransactionBody} from '~/features/ReviewTx/common/types'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'

import {ReviewTx} from '../ReviewTxScreen/ReviewTx/ReviewTx'

const MultipartyTransactionReviewContent = ({
  params,
  formattedTx,
}: {
  params: NonNullable<ReviewTxRoutes['review-tx']>
  formattedTx: FormattedTx
}) => {
  const {wallet, meta} = useSelectedWallet()
  const {isAuthDev} = useAuth()
  const memoContext = useReviewTxMemo()
  const navigation = useNavigation()

  if (!params.multiparty) {
    throw new Error(
      'MultipartyTransactionReviewScreen: multiparty info is required',
    )
  }

  // Find current wallet's keyHash from requiredSigners
  const currentWalletKeyHash = React.useMemo(() => {
    if (!params.multiparty?.requiredSigners) return null
    const currentSigner = params.multiparty.requiredSigners.find(
      (signer) => signer.walletId === wallet.id,
    )
    return currentSigner?.keyHash ?? null
  }, [params.multiparty, wallet.id])

  const handleExportTransaction = React.useCallback(
    async (signedCbor: string) => {
      if (!params?.cbor || !params.multiparty) return

      try {
        if (!currentWalletKeyHash) {
          Alert.alert(
            'Error',
            'Could not determine current wallet key hash for export',
          )
          return
        }

        const chainId =
          `cip34:${wallet.networkManager.chainId}-${wallet.networkManager.protocolMagic}` as ChainId

        // Convert requiredSigners to MultipartySigner format with signed status
        // For now, we'll mark all as unsigned since this is the initial export
        const requiredSigners = params.multiparty.requiredSigners.map(
          (signer) => ({
            walletId: signer.walletId,
            walletName: signer.walletName,
            keyHash: signer.keyHash,
            signed: signer.walletId === wallet.id, // Current wallet has signed
          }),
        )

        const txJson = constructMultipartyTransactionJSON({
          cborHex: signedCbor as TransactionCborHex,
          chainId,
          createdBy: currentWalletKeyHash as Bip32PublicKeyHex,
          requiredSigners,
          note: memoContext.memo || undefined,
        })

        const jsonString = JSON.stringify(txJson, null, 2)
        // Navigate to transaction signed screen
        // @ts-ignore - transaction-signed is a review-tx route
        navigation.navigate('transaction-signed', {
          jsonString,
        })
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Failed to export transaction',
        )
      }
    },
    [
      params?.cbor,
      params.multiparty,
      currentWalletKeyHash,
      wallet.networkManager.chainId,
      wallet.networkManager.protocolMagic,
      wallet.id,
      memoContext.memo,
      navigation,
    ],
  )

  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    partial: false,
    preventSubmit: false,
    context: 'send',
    formattedTx: formattedTx ?? null,
    multiparty: params?.multiparty,
    onSuccess: params?.onSuccess,
    onSuccessWithoutFeedback: params?.onSuccessWithoutFeedback,
    onError: params?.onError,
    onErrorWithoutFeedback: params?.onErrorWithoutFeedback,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
    onExportTransaction: handleExportTransaction,
  })

  const handleOnConfirm = React.useCallback(() => {
    if (params?.onConfirm) {
      params.onConfirm()
      return
    }

    if (params?.cbor != null) {
      onConfirm()
      return
    }

    throw new Error(
      'MultipartyTransactionReviewScreen: invalid state - cbor is required',
    )
  }, [params, onConfirm])

  return (
    <ReviewTx
      formattedTx={formattedTx}
      formattedMetadata={undefined}
      operations={params?.operations}
      operationsNotice={params?.operationsNotice}
      generalNotice={params?.generalNotice}
      details={params?.details}
      receiverCustomTitle={params?.receiverCustomTitle}
      createdBy={params?.createdBy}
      validationResult={undefined}
      cbor={params?.cbor != null && isAuthDev ? params.cbor : null}
      multiparty={params?.multiparty}
      onConfirm={meta.isReadOnly ? undefined : handleOnConfirm}
      readOnly={meta.isReadOnly}
      isReviewFlow={true}
    />
  )
}

export const MultipartyTransactionReviewScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const txBody = useTxBody({cbor: params?.cbor})
  const {formattedTx} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {coin: '0'},
      reference_inputs: [],
    }) as TransactionBody,
    params?.cbor ?? null,
  )

  if (!formattedTx || !params) {
    return null
  }

  if (!params.multiparty) {
    throw new Error(
      'MultipartyTransactionReviewScreen: multiparty info is required',
    )
  }

  return (
    <ReviewTxMemoProvider initialMemo={params?.memo ?? ''}>
      <MultipartyTransactionReviewContent
        params={params}
        formattedTx={formattedTx}
      />
    </ReviewTxMemoProvider>
  )
}
