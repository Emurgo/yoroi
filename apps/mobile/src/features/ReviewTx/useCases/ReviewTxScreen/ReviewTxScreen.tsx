import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {useLegacyOnConfirm} from '~/features/ReviewTx/common/hooks/useLegacyOnConfirm'
import {useNavigateTo} from '~/features/ReviewTx/common/hooks/useNavigateTo'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {mocks} from '~/features/ReviewTx/common/mocks'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {isDev} from '~/kernel/constants'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Copiable} from '~/ui/Copiable/Copiable'
import {ReviewTx} from './ReviewTx/ReviewTx'

export const ReviewTxScreen = () => {
  const navigation = useNavigation()
  const navigateTo = useNavigateTo()

  const {unsignedTx} = useReviewTx()
  const params = useUnsafeParams<ReviewTxRoutes['review-tx']>()
  const cbor = params?.cbor

  if (isDev)
    navigation.setOptions({
      headerRight: () => (cbor != null ? <Copiable text={cbor} /> : null),
    })

  const {legacyOnConfirm} = useLegacyOnConfirm({
    unsignedTx,
    onSuccess: params?.onSuccess,
    onError: params?.onError,
    onNotSupportedCIP1694: params?.onNotSupportedCIP1694,
    onCIP36SupportChange: params?.onCIP36SupportChange,
  })

  const {onConfirm} = useOnConfirm({
    cbor,
    partial: params?.partial,
    preventSubmit: params?.preventSubmit,
    onSuccess: params?.onSuccess,
    onError: params?.onError,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
  })

  // const txBody = useTxBody({cbor, unsignedTx})
  // const formattedTx = useFormattedTx(txBody)
  // const formattedMetadata = useFormattedMetadata({
  //   txBody,
  //   unsignedTx,
  //   cbor: cbor ?? null,
  // })

  React.useEffect(() => {
    return () => {
      params?.onCancel?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOnConfirm = () => {
    if (params?.onConfirm) {
      params?.onConfirm()
      return
    }
    if (unsignedTx != null && cbor == null) {
      legacyOnConfirm()
      return
    }
    if (cbor != null) {
      onConfirm()
      return
    }

    // TODO: Uncomment when bech32 is ready and properly mocked
    // throw new Error('ReviewTxScreen: invalid state')

    // For testing/demo purposes, navigate to submitted tx screen
    // In a real scenario, this would be called after successful transaction submission
    navigateTo.showSubmittedTxScreen()
  }

  // Use mock data as fallbacks when hooks return undefined or empty data
  const finalFormattedTx = mocks.reviewTx.formattedTx
  const finalFormattedMetadata = mocks.reviewTx.formattedMetadata as any
  const finalOperations =
    params?.operations || (mocks.reviewTx.operations as any)
  const finalOperationsNotice =
    params?.operationsNotice || (mocks.reviewTx.operationsNotice as any)
  const finalDetails = params?.details || (mocks.reviewTx.details as any)
  const finalReceiverCustomTitle =
    params?.receiverCustomTitle || (mocks.reviewTx.receiverCustomTitle as any)
  const finalCreatedBy = params?.createdBy || (mocks.reviewTx.createdBy as any)

  return (
    <ReviewTx
      formattedTx={finalFormattedTx}
      formattedMetadata={finalFormattedMetadata}
      operations={finalOperations}
      operationsNotice={finalOperationsNotice}
      details={finalDetails}
      receiverCustomTitle={finalReceiverCustomTitle}
      createdBy={finalCreatedBy}
      onConfirm={handleOnConfirm}
    />
  )
}
