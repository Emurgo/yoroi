import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../../components'
import {TxHistoryRouteNavigation} from '../../../../navigation'
import {useStrings} from '../useStrings'
import {AssetImage} from './AssetImage'

export const BuyADABanner = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleExchange = () => {
    navigation.navigate('exchange-create-order')
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
        <Text style={styles.title}>{strings.buyADATitle}</Text>

        <Spacer height={4} />

        <Text style={styles.description}>{strings.buyADADescription}</Text>

        <Spacer height={16} />

        <Button
          mainTheme
          title={strings.buyCrypto.toLocaleUpperCase()}
          onPress={handleExchange}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
        />

        <View style={styles.assetImageBox}>
          <AssetImage />
        </View>
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {},
    gradientRoot: {
      ...atoms.p_lg,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.relative,
      ...atoms.rounded_sm,
      backgroundColor: color.gray_cmin,
    },
    spaceButtonText: {
      ...atoms.p_0,
    },
    spaceButton: {
      ...atoms.px_lg,
      minHeight: 40,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
    description: {
      ...atoms.body_2_md_regular,
      maxWidth: 220,
    },
    assetImageBox: {
      ...atoms.absolute,
      top: 57,
      right: -4.57,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_2,
  }

  return {styles, colors} as const
}
