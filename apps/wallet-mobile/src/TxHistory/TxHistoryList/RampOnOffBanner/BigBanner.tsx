import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import image from '../../../assets/img/banner-buy-ada.png'
import {Button, Spacer} from '../../../components'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {useTheme} from '../../../theme'
import {Theme} from '../../../theme/types'
import {useStrings} from '../TxHistoryList'

const DIMENSIONS = Dimensions.get('window')

const BigBanner = () => {
  const {theme} = useTheme()

  const bannerWidth = DIMENSIONS.width - 16 * 2
  const bannerHeight = (bannerWidth * 174) / 512

  const strings = useStrings()

  const navigateTo = useNavigateTo()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  const handleExchange = () => {
    navigateTo.exchange()
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        style={styles.gradient}
        start={{x: 1, y: 1}}
        end={{x: 1, y: 1}}
        colors={theme.color.gradients['green']}
      >
        <View>
          <Image style={[styles.banner, {width: bannerWidth, height: bannerHeight}]} source={image} />
        </View>

        <Spacer height={16} />

        <Text style={styles.label}>{strings.getFirstAda}</Text>

        <Spacer height={4} />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Spacer height={16} />

        <Button
          testID="rampOnOffButton"
          shelleyTheme
          title={strings.buyADA.toLocaleUpperCase()}
          onPress={handleExchange}
        />
      </LinearGradient>
    </View>
  )
}

export default BigBanner

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      backgroundColor: theme.color['white-static'],
      paddingVertical: 18,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 25,
    },
    banner: {
      resizeMode: 'contain',
    },
    label: {
      fontSize: 20,
      lineHeight: 30,
      fontWeight: '500',
      color: theme.color['black-static'],
      fontFamily: 'Rubik',
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    text: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '400',
      color: theme.color['black-static'],
      fontFamily: 'Rubik',
      textAlign: 'center',
      paddingHorizontal: 50,
    },
  })
  return styles
}

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    exchange: () => navigation.navigate('rampOnOff-start-rampOnOff'),
  }
}
