import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../components'
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
    <View style={styles.root}>
      <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradientColor}>
        <View style={styles.viewTitle}>
          <Text style={styles.title}>{strings.needMoreCrypto}</Text>

          <Spacer width={5} />

          <TouchableOpacity onPress={onClose}>
            <Icon.Close size={24} />
          </TouchableOpacity>
        </View>

        <Spacer height={8} />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Spacer height={8} />

        <TouchableOpacity onPress={handleExchange}>
          <Text style={styles.textButton}>{strings.buyCrypto.toLocaleUpperCase()}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.gray_cmin,
      paddingBottom: 18,
    },
    gradient: {
      flex: 1,
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    viewTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    title: {
      fontSize: 16,
      color: color.black_static,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
      lineHeight: 24,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    text: {
      fontSize: 16,
      color: color.black_static,
      fontWeight: '400',
      fontFamily: 'Rubik-Regular',
      lineHeight: 24,
    },
    textButton: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
      color: color.primary_c500,
      lineHeight: 22,
      flex: 1,
      borderRadius: 8,
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
  }
  return {styles, colors} as const
}
