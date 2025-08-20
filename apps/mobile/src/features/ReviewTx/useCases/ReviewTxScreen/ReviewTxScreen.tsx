import React from 'react'

import {useFormattedMetadata} from '~/features/ReviewTx/common/hooks/useFormattedMetadata'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useLegacyOnConfirm} from '~/features/ReviewTx/common/hooks/useLegacyOnConfirm'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {ReviewTx} from './ReviewTx/ReviewTx'

export const ReviewTxScreen = () => {
  const {unsignedTx} = useReviewTx()
  const params = useUnsafeParams<ReviewTxRoutes['review-tx']>()
  const cbor = params?.cbor

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
      operations={params?.operations as React.ReactNode[] | undefined}
      operationsNotice={params?.operationsNotice as React.ReactNode | undefined}
      details={params?.details}
      receiverCustomTitle={
        params?.receiverCustomTitle as React.ReactNode | undefined
      }
      createdBy={params?.createdBy as React.ReactNode | undefined}
      onConfirm={handleOnConfirm}
    />
  )
}
