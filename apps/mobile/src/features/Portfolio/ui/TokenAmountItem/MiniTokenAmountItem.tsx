import {
  amountFormatter,
  infoExtractName,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'

import {useModal} from '~/ui/Modal/ModalContext'
import {Text} from '~/ui/Text/Text'
import {useStrings} from '~/kernel/i18n/useStrings'
import {TokenDetails} from '../ReviewTx/common/TokenDetails'
import {TokenInfoIcon} from './TokenInfoIcon'

type MiniTokenAmountItemProps = {
  amount: Portfolio.Token.Amount
  style?: ViewProps['style']
}

export const MiniTokenAmountItem = ({amount}: MiniTokenAmountItemProps) => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const {palette: p} = useTheme()

  const {info} = amount
  const isPrimary = isPrimaryToken(info)
  const name = infoExtractName(info)

  const formattedQuantity = amountFormatter({dropTraillingZeros: true})(amount)

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.txReview.tokenDetailsTitle,
      content: <TokenDetails tokenInfo={info} />,
      height: isPrimary ? 450 : windowHeight * 0.8,
    })
  }

  return (
    <TouchableOpacity
      testID="miniAssetItem"
      onPress={handleShowTokenDetails}
      style={[a.flex_row, a.gap_sm, a.justify_between]}
    >
      <View style={[a.flex_row, a.gap_sm]}>
        <TokenInfoIcon info={amount.info} size="sm" />

        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[{color: p.gray_600}, a.body_1_lg_regular]}
          testID="tokenInfoText"
        >
          {name}
        </Text>
      </View>

      <Text style={[{color: p.gray_900}, a.body_1_lg_medium]}>
        {formattedQuantity}
      </Text>
    </TouchableOpacity>
  )
}
