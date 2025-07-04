import {
  amountFormatter,
  infoExtractName,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'

import {useModal} from '../../../../components/Modal/ModalContext'
import {Text} from '../../../../components/Text'
import {useStrings} from '../../../ReviewTx/common/hooks/useStrings'
import {TokenDetails} from '../../../ReviewTx/common/TokenDetails'
import {TokenInfoIcon} from './TokenInfoIcon'

type MiniTokenAmountItemProps = {
  amount: Portfolio.Token.Amount
  style?: ViewProps['style']
}

export const MiniTokenAmountItem = ({amount}: MiniTokenAmountItemProps) => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const {styles} = useStyles()

  const {info} = amount
  const isPrimary = isPrimaryToken(info)
  const name = infoExtractName(info)

  const formattedQuantity = amountFormatter({dropTraillingZeros: true})(amount)

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.tokenDetailsTitle,
      content: <TokenDetails tokenInfo={info} />,
      height: isPrimary ? 450 : windowHeight * 0.8,
    })
  }

  return (
    <TouchableOpacity
      testID="miniAssetItem"
      onPress={handleShowTokenDetails}
      style={styles.container}
    >
      <View style={styles.info}>
        <TokenInfoIcon info={amount.info} size="sm" />

        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={styles.name}
          testID="tokenInfoText"
        >
          {name}
        </Text>
      </View>

      <Text style={styles.quantity}>{formattedQuantity}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_row,
      ...atoms.gap_sm,
      ...atoms.justify_between,
    },
    info: {
      ...atoms.flex_row,
      ...atoms.gap_sm,
    },
    name: {
      color: color.gray_600,
      ...atoms.body_1_lg_regular,
    },
    quantity: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
  })

  return {styles}
}
