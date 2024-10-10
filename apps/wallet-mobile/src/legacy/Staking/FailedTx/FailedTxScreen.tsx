import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {SafeArea} from '../../../components/SafeArea'
import {Space} from '../../../components/Space/Space'
import {Spacer} from '../../../components/Spacer/Spacer'
import {Text} from '../../../components/Text'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <SafeArea style={styles.container}>
      <FailedTxImage />

      <Space height="lg" />

      <Text style={styles.title}>{strings.notEnoughFunds}</Text>

      <Text style={styles.text}>{strings.noFundsToProcess}</Text>

      <Spacer height={22} />

      <Button onPress={navigateTo.buyAda} title={strings.buyAda} shelleyTheme />

      <Space height="lg" />

      <Button onPress={navigateTo.main} title={strings.goToMain} textStyles={styles.outlineText} outline />
    </SafeArea>
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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.p_lg,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_xs,
      textAlign: 'center',
    },
    text: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 330,
    },
    outlineText: {
      color: color.primary_500,
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
