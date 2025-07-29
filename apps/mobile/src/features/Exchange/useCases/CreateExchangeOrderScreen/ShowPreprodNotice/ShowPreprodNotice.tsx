import {useExchange} from '@yoroi/exchange'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '../../common/useStrings'
import {PreprodNoticeIllustration} from '../illustrations/PreprodNoticeIllustration'

export const ShowPreprodNotice = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {
    selected: {network},
  } = useWalletManager()
  const {orderType} = useExchange()

  const isPreprod = network === Chain.Network.Preprod

  if (isPreprod && orderType === 'buy')
    return (
      <View style={[a.p_lg, a.flex_1, a.align_center, a.justify_center]}>
        <Space.Height._2xl />

        <PreprodNoticeIllustration />

        <Space.Height.lg />

        <Text
          style={[a.heading_3_medium, a.px_sm, a.text_center, ta.el_gray_max]}
        >
          {strings.createOrderPreprodNoticeTitle}
        </Text>

        <Text
          style={[
            ta.text_gray_medium,
            a.body_1_lg_regular,
            a.text_center,
            {maxWidth: 300},
          ]}
        >
          {strings.createOrderPreprodNoticeText}
        </Text>
      </View>
    )

  return null
}
