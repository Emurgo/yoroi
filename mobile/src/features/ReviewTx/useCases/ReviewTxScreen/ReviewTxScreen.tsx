import * as React from 'react'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {useFormattedMetadata} from '~/features/ReviewTx/common/hooks/useFormattedMetadata'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {FormattedTx, TransactionBody} from '~/features/ReviewTx/common/types'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'

import {ReviewTx} from './ReviewTx/ReviewTx'

const getTransactionAnalyticsProperties = (
  formattedTx: FormattedTx,
  context?: NonNullable<ReviewTxRoutes['review-tx']>['context'],
) => {
  const notOwnedOutputs = formattedTx.outputs.filter(
    (output) => !output.ownAddress,
  )
  const spentAssets = notOwnedOutputs.flatMap((output) => output.assets)
  const uniqueAssets = new Map()

  spentAssets.forEach((asset) => {
    const key = `${asset.tokenInfo.id}`
    if (!uniqueAssets.has(key)) {
      uniqueAssets.set(key, {
        policy_id: asset.tokenInfo.id.split('.')[0] ?? '',
        asset_name: asset.tokenInfo.id.split('.')[1] ?? '',
        asset_ticker: asset.tokenInfo.ticker ?? asset.tokenInfo.name ?? '',
      })
    }
  })

  return {
    type: context ?? '',
    asset_count: uniqueAssets.size,
    asset_list: JSON.stringify(Array.from(uniqueAssets.values())),
  }
}

export const ReviewTxScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const {trackEvent} = useAnalyticsTracking()

  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    partial: params?.partial,
    preventSubmit: params?.preventSubmit,
    onSuccess: params?.onSuccess,
    onSuccessWithoutFeedback: params?.onSuccessWithoutFeedback,
    onError: params?.onError,
    onErrorWithoutFeedback: params?.onErrorWithoutFeedback,
    onCancel: params?.onCancel,
    onClose: params?.onClose,
  })

  const txBody = useTxBody({cbor: params?.cbor})
  const {formattedTx, isLoading, areTokenInfosLoaded} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {coin: '0'},
      reference_inputs: [],
    }) as TransactionBody,
    params?.cbor ?? null,
  )
  const formattedMetadata = useFormattedMetadata({
    txBody,
    cbor: params?.cbor ?? null,
  })

  const hasTrackedReviewViewRef = React.useRef(false)

  React.useEffect(() => {
    if (hasTrackedReviewViewRef.current || !areTokenInfosLoaded || !formattedTx)
      return
    hasTrackedReviewViewRef.current = true

    const properties = getTransactionAnalyticsProperties(
      formattedTx,
      params?.context,
    )
    trackEvent(AnalyticsEventEnum.TransactionReviewModalViewed, properties)
  }, [trackEvent, formattedTx, areTokenInfosLoaded, params?.context])

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
    if (params?.cbor != null) {
      trackEvent(AnalyticsEventEnum.TransactionReviewSubmitModalViewed)
      onConfirm()
      return
    }

    throw new Error('ReviewTxScreen: invalid state - cbor is required')
  }

  if (isLoading || !formattedTx) {
    return null
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
