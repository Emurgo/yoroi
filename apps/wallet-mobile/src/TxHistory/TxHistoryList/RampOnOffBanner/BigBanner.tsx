import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../components'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {useTheme} from '../../../theme'
import {Theme} from '../../../theme/types'
import {useStrings} from '../TxHistoryList'
import {IllustrationBannerBuyADA} from './Common/IllustrationBannerBuyADA'

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
          <IllustrationBannerBuyADA width={bannerWidth} height={bannerHeight} />
        </View>

        <Spacer />

        <Text style={styles.label}>{strings.getFirstAda}</Text>

        <Spacer height={4} />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Spacer />

        <Button
          testID="rampOnOffButton"
          shelleyTheme
          title={strings.buyADA.toLocaleUpperCase()}
          onPress={handleExchange}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
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
      paddingBottom: 18,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 25,
    },
    spaceButtonText: {
      padding: 0,
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
    spaceButton: {
      paddingHorizontal: 16,
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
