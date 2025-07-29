import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {Copiable} from '~/ui/Copiable/Copiable'
import {isDev} from '~/kernel/env'
import {ReviewTxRoutes, useUnsafeParams} from '~/kernel/navigation'
import {useFormattedMetadata} from '~/features/ReviewTx/common/hooks/useFormattedMetadata'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useLegacyOnConfirm} from '~/features/ReviewTx/common/hooks/useLegacyOnConfirm'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {ReviewTx} from './ReviewTx/ReviewTx'

export const ReviewTxScreen = () => {
  const navigation = useNavigation()

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

  const txBody = useTxBody({cbor, unsignedTx})
  const formattedTx = useFormattedTx(txBody)
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

  return (
    <ReviewTx
      formattedTx={formattedTx}
      formattedMetadata={formattedMetadata}
      operations={params?.operations}
      operationsNotice={params?.operationsNotice}
      details={params?.details}
      receiverCustomTitle={params?.receiverCustomTitle}
      createdBy={params?.createdBy}
      onConfirm={handleOnConfirm}
    />
  )
}
