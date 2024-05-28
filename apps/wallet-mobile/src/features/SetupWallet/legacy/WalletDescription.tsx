import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Icon, Text} from '../../../components'

export const WalletDescription = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.description}>
      <Icon.YoroiWallet color={colors.white} width={208} height={60} />

      <View style={styles.emurgoCreditsContainer}>
        <Text light>{strings.slogan}</Text>
      </View>
    </View>
  )
}

const messages = defineMessages({
  slogan: {
    id: 'components.walletinit.walletdescription.slogan',
    defaultMessage: '!!!Your gateway to the financial world',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    slogan: intl.formatMessage(messages.slogan),
  }
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    description: {
      alignItems: 'center',
    },
    emurgoCreditsContainer: {
      marginTop: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
  })
  return {styles, colors: {white: color.white_static}} as const
}
