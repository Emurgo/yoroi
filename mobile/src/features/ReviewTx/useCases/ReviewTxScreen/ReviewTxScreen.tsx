import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useFormattedMetadata} from '~/features/ReviewTx/common/hooks/useFormattedMetadata'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useLegacyOnConfirm} from '~/features/ReviewTx/common/hooks/useLegacyOnConfirm'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {Copiable} from '~/ui/Copiable/Copiable'

import {ReviewTx} from './ReviewTx/ReviewTx'

export const ReviewTxScreen = () => {
  console.log('[ReviewTxScreen] Component rendering')

  const navigation = useNavigation()
  const {unsignedTx} = useReviewTx()
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const cbor = params?.cbor

  console.log('[ReviewTxScreen] Initial state:', {
    hasUnsignedTx: !!unsignedTx,
    hasCbor: !!cbor,
    paramsKeys: params ? Object.keys(params) : null,
  })

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (cbor != null ? <Copiable text={cbor} /> : null),
    })
  }, [navigation, cbor])

  const {legacyOnConfirm} = useLegacyOnConfirm({
    unsignedTx,
    onSuccess: params?.onSuccess,
    onSuccessWithoutFeedback: params?.onSuccessWithoutFeedback,
    onError: params?.onError,
    onErrorWithoutFeedback: params?.onErrorWithoutFeedback,
    onNotSupportedCIP1694: params?.onNotSupportedCIP1694,
    onCIP36SupportChange: params?.onCIP36SupportChange,
  })

  const {onConfirm} = useOnConfirm({
    cbor,
    partial: params?.partial,
    preventSubmit: params?.preventSubmit,
    onSuccess: params?.onSuccess,
    onSuccessWithoutFeedback: params?.onSuccessWithoutFeedback,
    onError: params?.onError,
    onErrorWithoutFeedback: params?.onErrorWithoutFeedback,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
  })

  const {
    txBody,
    isLoading: isTxBodyLoading,
    error: txBodyError,
  } = useTxBody({cbor, unsignedTx})

  console.log('[ReviewTxScreen] useTxBody result:', {
    hasTxBody: !!txBody,
    isTxBodyLoading,
    txBodyError: txBodyError?.message,
  })

  const {
    data: formattedTx,
    isLoading: isFormattedTxLoading,
    error: formattedTxError,
  } = useFormattedTx(txBody)

  console.log('[ReviewTxScreen] useFormattedTx result:', {
    hasFormattedTx: !!formattedTx,
    isFormattedTxLoading,
    formattedTxError: formattedTxError?.message,
  })

  const formattedMetadata = useFormattedMetadata({
    txBody,
    unsignedTx,
    cbor: cbor ?? null,
  })

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

    throw new Error('ReviewTxScreen: invalid state')
  }

  if (txBodyError) {
    throw txBodyError
  }

  if (formattedTxError) {
    throw formattedTxError
  }

  console.log('[ReviewTxScreen] Render conditions:', {
    isTxBodyLoading,
    isFormattedTxLoading,
    hasTxBody: !!txBody,
    hasFormattedTx: !!formattedTx,
    willRenderNull:
      isTxBodyLoading || isFormattedTxLoading || !txBody || !formattedTx,
  })

  if (isTxBodyLoading || isFormattedTxLoading || !txBody || !formattedTx) {
    console.log('[ReviewTxScreen] Returning null - loading or missing data')
    return null
  }

  console.log('[ReviewTxScreen] Rendering ReviewTx component')
  return (
    <ReviewTx
      formattedTx={formattedTx}
      formattedMetadata={formattedMetadata ?? undefined}
      operations={params?.operations}
      operationsNotice={params?.operationsNotice}
      details={params?.details}
      receiverCustomTitle={params?.receiverCustomTitle}
      createdBy={params?.createdBy}
      onConfirm={handleOnConfirm}
    />
  )
}
