import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {View, useWindowDimensions} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {TransactionSummary} from './TransactionSummary'

const BOTTOM_ACTION_SECTION = 220

export const ReviewSwap = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const {palette: p} = useTheme()
  const {height: deviceHeight} = useWindowDimensions()
  const strings = useStrings()
  const {track} = useMetrics()
  const {navigateToTxReview} = useWalletNavigation()

  const swapForm = useSwap()

  if (swapForm.createTx === undefined) return null
  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const trackSwapOrderSubmitted = () => {
    track.swapOrderSubmitted({
      from_asset: [
        {
          asset_name: tokenInInfo?.name,
          asset_ticker: tokenInInfo?.ticker,
          policy_id: tokenInInfo?.id.split('.')[0],
        },
      ],
      to_asset: [
        {
          asset_name: tokenOutInfo?.name,
          asset_ticker: tokenOutInfo?.ticker,
          policy_id: tokenOutInfo?.id.split('.')[0],
        },
      ],
      order_type: swapForm.orderType,
      slippage_tolerance: swapForm.slippageInput.value,
      from_amount: String(swapForm.createTx?.totalInput ?? 0),
      to_amount: String(swapForm.createTx?.totalOutput ?? 0),
      pool_source: swapForm.createTx?.splits[0]?.poolId ?? '',
      swap_fees: Number(swapForm.createTx?.totalFee),
    })
  }

  const onSwapTxSuccess = () => {
    trackSwapOrderSubmitted()
    swapForm.action({type: 'ResetForm'})
  }

  const onNext = () => {
    const protocol = swapForm.createTx?.splits[0]?.protocol
    const fallbackImageUrl = swapForm.createTx?.splits[0]?.aggregatorImageUrl
    const nameOverride =
      protocol === Swap.Protocol.Unsupported
        ? swapForm.createTx?.splits[0]?.aggregatorDexKey
        : undefined

    navigateToTxReview({
      onSuccess: onSwapTxSuccess,
      cbor: swapForm.createTx?.cbor,
      receiverCustomTitle:
        protocol !== undefined ? (
          <ProtocolAvatar
            protocol={protocol}
            fallbackImageUrl={fallbackImageUrl}
            nameOverride={nameOverride}
          />
        ) : undefined,
      details: {
        component: <TransactionSummary swapForm={swapForm} />,
        title: strings.swap.swapDetailsTitle,
        height: 600,
      },
    })
  }

  return (
    <SafeArea>
      <View style={[a.flex_1, a.justify_between]}>
        <ScrollView contentContainerStyle={a.px_lg}>
          <View
            onLayout={(event) => {
              const {height} = event.nativeEvent.layout
              setContentHeight(height + BOTTOM_ACTION_SECTION)
            }}
          >
            <TransactionSummary swapForm={swapForm} />
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          a.px_lg,
          {
            ...(deviceHeight < contentHeight && {
              borderTopWidth: 1,
              borderTopColor: p.gray_200,
            }),
          },
        ]}
      >
        <Button
          testID="swapButton"
          title={strings.swap.next}
          onPress={onNext}
        />
      </View>
    </SafeArea>
  )
}
