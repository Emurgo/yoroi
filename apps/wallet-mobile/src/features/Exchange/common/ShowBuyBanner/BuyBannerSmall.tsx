import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, ButtonType} from '../../../../components/Button/NewButton'
import {Icon} from '../../../../components/Icon'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../useStrings'

type SmallBannerProps = {
  onClose: () => void
}

export const BuyBannerSmall = ({onClose}: SmallBannerProps) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleExchange = () => {
    navigation.navigate('exchange-create-order')
  }
  return (
    <LinearGradient style={styles.container} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradientColor}>
      <View style={styles.viewTitle}>
        <Text style={styles.title}>{strings.needMoreCrypto}</Text>

        <Button type={ButtonType.SecondaryText} icon={Icon.Close} onPress={onClose} style={styles.closeButton} />
      </View>

      <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

      <Button
        testID="rampOnOffButton"
        style={styles.button}
        title={strings.buyCrypto}
        size="S"
        onPress={handleExchange}
      />
    </LinearGradient>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.px_lg,
      ...atoms.py_md,
      ...atoms.gap_sm,
    },
    viewTitle: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    closeButton: {
      ...atoms.p_0,
      flexGrow: 0,
    },
    button: {
      ...atoms.self_center,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_max,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    text: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
    gray: color.gray_max,
  }
  return {styles, colors} as const
}
