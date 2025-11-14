import * as React from 'react'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {ReviewTxMemoProvider} from '~/features/ReviewTx/common/context/ReviewTxMemoContext'
import {useFormattedMetadata} from '~/features/ReviewTx/common/hooks/useFormattedMetadata'
import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useOnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {
  FormattedMetadata,
  FormattedTx,
  TransactionBody,
} from '~/features/ReviewTx/common/types'
import {logger} from '~/kernel/logger/logger'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewTxRoutes} from '~/kernel/navigation/types'

import {ReviewTx} from './ReviewTx/ReviewTx'

const getTransactionAnalyticsProperties = (
  formattedTx: FormattedTx,
  context?: NonNullable<ReviewTxRoutes['review-tx']>['context'],
  aggregator?: string,
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
    aggregator: aggregator ?? '',
  }
}

const ReviewTxContent = ({
  params,
  formattedTx,
  formattedMetadata,
  trackEvent,
}: {
  params: NonNullable<ReviewTxRoutes['review-tx']>
  formattedTx: FormattedTx
  formattedMetadata?: FormattedMetadata
  trackEvent: ReturnType<typeof useAnalyticsTracking>['trackEvent']
}) => {
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

export const ReviewTxScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const {trackEvent} = useAnalyticsTracking()

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

  // Log transaction details and CBOR for comparison with develop branch
  React.useEffect(() => {
    if (!txBody || isLoading) return

    const certs = txBody.certs ?? []
    const withdrawals = txBody.withdrawals ?? {}

    // Log full CBOR separately for easy comparison
    if (params?.cbor) {
      logger.info('ReviewTx (mobile-experimental): Full CBOR', {
        context: params?.context,
        cbor: params.cbor,
        cborLength: params.cbor.length,
      })
    }

    logger.info('ReviewTx (mobile-experimental): Transaction details', {
      context: params?.context,
      cborPreview: params?.cbor ? `${params.cbor.substring(0, 100)}...` : null,
      cborLength: params?.cbor?.length ?? 0,
      txBody: {
        inputs: txBody.inputs?.length ?? 0,
        outputs: txBody.outputs?.length ?? 0,
        fee: txBody.fee,
        certificates: {
          count: certs.length,
          types: certs.map((cert) => {
            const entry = Object.entries(cert)[0]
            return entry ? entry[0] : 'unknown'
          }),
          details: certs.map((cert) => {
            const entry = Object.entries(cert)[0]
            if (!entry) return null
            const [type, certificate] = entry
            return {
              type,
              stakeCredential:
                'stake_credential' in certificate
                  ? certificate.stake_credential
                  : undefined,
              poolKeyHash:
                'pool_keyhash' in certificate
                  ? certificate.pool_keyhash
                  : undefined,
              drep: 'drep' in certificate ? certificate.drep : undefined,
            }
          }),
        },
        withdrawals: {
          count: Object.keys(withdrawals).length,
          addresses: Object.keys(withdrawals),
          amounts: Object.entries(withdrawals).map(([addr, amount]) => ({
            address: addr,
            amount: amount,
          })),
        },
      },
    })
  }, [txBody, isLoading, params?.context, params?.cbor])

  const hasTrackedReviewViewRef = React.useRef(false)

  React.useEffect(() => {
    if (hasTrackedReviewViewRef.current || !areTokenInfosLoaded || !formattedTx)
      return
    hasTrackedReviewViewRef.current = true

    const properties = getTransactionAnalyticsProperties(
      formattedTx,
      params?.context,
      params?.aggregator,
    )
    trackEvent(AnalyticsEventEnum.TransactionReviewModalViewed, properties)
  }, [
    trackEvent,
    formattedTx,
    areTokenInfosLoaded,
    params?.context,
    params?.aggregator,
  ])

  React.useEffect(() => {
    return () => {
      params?.onCancel?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || !formattedTx || !params) {
    return null
  }

  return (
    <ReviewTxMemoProvider>
      <ReviewTxContent
        params={params}
        formattedTx={formattedTx}
        formattedMetadata={formattedMetadata}
        trackEvent={trackEvent}
      />
    </ReviewTxMemoProvider>
  )
}
