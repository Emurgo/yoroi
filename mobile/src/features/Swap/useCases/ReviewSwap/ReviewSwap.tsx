import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {View, useWindowDimensions} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {usePageViewTracking} from '~/features/Analytics/hooks/usePageViewTracking'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
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
  const {navigateToTxReview} = useWalletNavigation()

  usePageViewTracking('Swap Review Page Viewed')

  const swapForm = useSwap()

  if (swapForm.createTx === undefined) return null

  const onSwapTxSuccess = () => {
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
      context: 'swap',
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

      <SafeArea.Footer>
        <View
          style={[
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
      </SafeArea.Footer>
    </SafeArea>
  )
}
