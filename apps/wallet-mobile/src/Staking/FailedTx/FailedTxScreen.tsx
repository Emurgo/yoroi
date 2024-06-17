import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../components'
import {Space} from '../../components/Space/Space'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <View style={styles.container}>
      <FailedTxImage />

      <Space height="l" />

      <Text style={styles.title}>{strings.notEnoughFunds}</Text>

      <Text style={styles.text}>{strings.noFundsToProcess}</Text>

      <Spacer height={22} />

      <Button onPress={navigateTo.buyAda} title={strings.buyAda} shelleyTheme />

      <Space height="l" />

      <Button onPress={navigateTo.main} title={strings.goToMain} textStyles={styles.outlineText} outline />
    </View>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation()

  return {
    buyAda: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'exchange-create-order',
          },
        },
      }),
    main: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'history-list',
          },
        },
      }),
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      ...padding['l'],
    },
    title: {
      color: color.gray.max,
      ...typography['heading-3-medium'],
      ...padding['x-s'],
      textAlign: 'center',
    },
    text: {
      color: color.gray[600],
      ...typography['body-2-m-regular'],
      textAlign: 'center',
      maxWidth: 330,
    },
    outlineText: {
      color: theme.color.primary[500],
    },
  })
  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    notEnoughFunds: intl.formatMessage(messages.notEnoughFunds),
    noFundsToProcess: intl.formatMessage(messages.noFundsToProcess),
    buyAda: intl.formatMessage(messages.buyAda),
    goToMain: intl.formatMessage(messages.goToMain),
  }
}

const messages = defineMessages({
  notEnoughFunds: {
    id: 'components.stakingcenter.failedDelegation.notEnoughFunds',
    defaultMessage: '!!!Not enough funds',
  },
  noFundsToProcess: {
    id: 'components.stakingcenter.failedDelegation.noFundsToProcess',
    defaultMessage: '!!!Your transaction cannot be processed due to lack of funds on your wallet balance',
  },
  buyAda: {
    id: 'components.stakingcenter.failedDelegation.buyAda',
    defaultMessage: '!!!Buy ada',
  },
  goToMain: {
    id: 'components.stakingcenter.failedDelegation.goToMain',
    defaultMessage: '!!!Go to main wallet page',
  },
})