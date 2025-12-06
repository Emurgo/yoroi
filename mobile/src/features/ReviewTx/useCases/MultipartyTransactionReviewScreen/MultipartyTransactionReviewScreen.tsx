/**
 * Multiparty Transaction Review Screen
 * Shows transaction details with signer status for multiparty transactions
 * Reuses the regular ReviewTx component with multiparty props
 */
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {ReviewTxMemoProvider} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
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
  const {meta} = useSelectedWallet()
  const {isAuthDev} = useAuth()

  if (!params.multiparty) {
    throw new Error(
      'MultipartyTransactionReviewScreen: multiparty info is required',
    )
  }

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
