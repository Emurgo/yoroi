import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Icon, Spacer} from '../../../../components'
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
    <>
      <View style={styles.root}>
        <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradientColor}>
          <View style={styles.viewTitle}>
            <Text style={styles.title}>{strings.needMoreCrypto}</Text>

            <Spacer width={5} />

            <TouchableOpacity onPress={onClose}>
              <Icon.Close size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <Spacer height={8} />

          <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

          <Spacer height={8} />

          <Button
            testID="rampOnOffButton"
            mainTheme
            title={strings.buyCrypto.toLocaleUpperCase()}
            onPress={handleExchange}
            style={styles.spaceButton}
          />
        </LinearGradient>
      </View>

      <Spacer height={18} />
    </>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_high,
    },
    gradient: {
      flex: 1,
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      ...atoms.px_lg,
      ...atoms.py_md,
    },
    viewTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_cmax,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    text: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
    },
    spaceButton: {
      maxWidth: 100,
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
    gray: color.gray_cmax,
  }
  return {styles, colors} as const
}
