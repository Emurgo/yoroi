import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Icon, Text} from '../components'
import {COLORS} from '../theme'

export const WalletDescription = () => {
  const strings = useStrings()

  return (
    <View style={styles.description}>
      <Icon.YoroiWallet color={COLORS.WHITE} width={208} height={60} />
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
