import {CardanoMobileWrapped, isMultisigWallet} from '@yoroi/cardano-wallet'
import {validateTransactionCbor} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {useAuth} from '~/features/Auth/context/AuthProvider'
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
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {ReviewContext, ReviewTxRoutes} from '~/kernel/navigation/types'
import {OperationContext} from '~/ui/ResultScreen/types'

import {MultipartyTransactionReviewScreen} from '../MultipartyTransactionReviewScreen/MultipartyTransactionReviewScreen'
import {MultisigTransactionReviewScreen} from '../MultisigTransactionReviewScreen/MultisigTransactionReviewScreen'
import {ReviewTx} from './ReviewTx/ReviewTx'

const mapReviewContextToOperationContext = (
  context?: ReviewContext,
): OperationContext => {
  switch (context) {
    case 'send':
      return 'send'
    case 'swap':
      return 'swap'
    case 'delegate':
    case 'undelegate':
      return 'delegate'
    case 'delegate vote':
      return 'governance'
    case 'withdraw rewards':
      return 'withdraw'
    case 'utxo-consolidation':
      return 'utxo-consolidation'
    default:
      return 'default'
  }
}

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
  validationResult,
  trackEvent,
}: {
  params: NonNullable<ReviewTxRoutes['review-tx']>
  formattedTx: FormattedTx
  formattedMetadata?: FormattedMetadata
  validationResult?: {valid: boolean; errors: string[]; warnings: string[]}
  trackEvent: ReturnType<typeof useAnalyticsTracking>['trackEvent']
}) => {
  const {meta} = useSelectedWallet()
  const {isAuthDev} = useAuth()
  const {onConfirm} = useOnConfirm({
    cbor: params?.cbor,
    partial: params?.partial,
    preventSubmit: params?.preventSubmit,
    context: mapReviewContextToOperationContext(params?.context),
    formattedTx: formattedTx ?? null,
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
      generalNotice={params?.generalNotice}
      details={params?.details}
      receiverCustomTitle={params?.receiverCustomTitle}
      createdBy={params?.createdBy}
      validationResult={validationResult}
      cbor={params?.cbor != null && isAuthDev ? params.cbor : null}
      onConfirm={meta.isReadOnly ? undefined : handleOnConfirm}
      readOnly={meta.isReadOnly}
      isReviewFlow={true}
    />
  )
}

export const ReviewTxScreen = () => {
  const params = useUnsafeParams<NonNullable<ReviewTxRoutes['review-tx']>>()
  const {trackEvent} = useAnalyticsTracking()
  const {wallet} = useSelectedWallet()

  // Check if this is a multisig wallet - if so, use multisig review screen
  if (isMultisigWallet(wallet)) {
    return <MultisigTransactionReviewScreen />
  }

  // Check if this is a multiparty transaction - if so, use multiparty review screen
  if (params?.multiparty) {
    return <MultipartyTransactionReviewScreen />
  }

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

  // Validate transaction CBOR if available - deferred to useEffect to avoid blocking render
  const [validationResult, setValidationResult] = React.useState<
    | {
        valid: boolean
        errors: string[]
        warnings: string[]
      }
    | undefined
  >(undefined)

  React.useEffect(() => {
    if (!params?.cbor) {
      setValidationResult(undefined)
      return
    }

    // Defer validation to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      try {
        const result = CardanoMobileWrapped.cslScope((csl) => {
          return validateTransactionCbor(csl, params.cbor!)
        })
        setValidationResult(result)
      } catch {
        setValidationResult(undefined)
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [params?.cbor])

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
    <ReviewTxMemoProvider initialMemo={params?.memo ?? ''}>
      <ReviewTxContent
        params={params}
        formattedTx={formattedTx}
        formattedMetadata={formattedMetadata}
        validationResult={validationResult}
        trackEvent={trackEvent}
      />
    </ReviewTxMemoProvider>
  )
}
