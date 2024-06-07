import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Text} from '../../../components'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

// TODO: fix
export const DisableEasyConfirmationScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const {walletManager} = useWalletManager()

  const handleOnDisableConfirmation = () => {
    walletManager.disableEasyConfirmation(wallet.id)
    navigation.goBack()
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={[styles.disableSection]}>
        <Text style={styles.heading}>{strings.disableHeading}</Text>
      </View>

      <View style={styles.actions}>
        <Button title={strings.disableButton} onPress={handleOnDisableConfirmation} shelleyTheme />
      </View>
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    disableHeading: intl.formatMessage(messages.disableHeading),
    disableButton: intl.formatMessage(messages.disableButton),
  }
}

const messages = defineMessages({
  disableHeading: {
    id: 'components.settings.disableeasyconfirmationscreen.disableHeading',
    defaultMessage: '!!!By disabling this option you will be able to spend your assets only with your master password.',
  },
  disableButton: {
    id: 'components.settings.disableeasyconfirmationscreen.disableButton',
    defaultMessage: '!!!Disable',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    heading: {
      ...atoms.body_1_lg_regular,
    },
    disableSection: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    actions: {
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
  })
  return styles
}
