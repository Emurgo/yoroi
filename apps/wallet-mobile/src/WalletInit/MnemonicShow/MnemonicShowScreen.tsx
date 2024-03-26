import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import assert from 'assert'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Dimensions, Image, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import recoveryPhrase from '../../assets/img/recovery_phrase.png'
import {Button, Text} from '../../components'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {isEmptyString} from '../../utils/utils'
import {MnemonicBackupImportanceModal} from '../MnemonicBackupModal'

export const MnemonicShowScreen = () => {
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'mnemonic-show'>>()
  const strings = useStrings()
  const mnemonic = route.params.mnemonic
  const [modal, setModal] = React.useState(false)
  const showModal = () => setModal(true)
  const hideModal = () => setModal(false)

  const navigateToMnemonicCheck = () => {
    const {name, password, networkId, walletImplementationId} = route.params
    assert(!isEmptyString(mnemonic), 'navigateToMnemonicCheck:: mnemonic')
    assert(!isEmptyString(password), 'navigateToMnemonicCheck:: password')
    assert(!isEmptyString(name), 'navigateToMnemonicCheck:: name')
    assert(networkId != null, 'navigateToMnemonicCheck:: networkId')
    assert(!isEmptyString(walletImplementationId), 'walletImplementationId')

    navigation.navigate('mnemonic-check', {
      mnemonic,
      password,
      name,
      networkId,
      walletImplementationId,
    })
    hideModal()
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer} bounces={false}>
          <View style={styles.mnemonicNote}>
            <Text>{strings.mnemonicNote}</Text>
          </View>

          <View style={styles.mnemonicWords}>
            {mnemonic.split(' ').map((word, index) => (
              <Text key={index} style={styles.mnemonicText} testID={`mnemonic-${index}`}>
                {word}
              </Text>
            ))}
          </View>

          {/* If screen is small hide image */}

          {Dimensions.get('window').height > 480 && (
            <View style={styles.image}>
              <Image source={recoveryPhrase} />
            </View>
          )}
        </ScrollView>

        <View style={styles.button}>
          <Button onPress={showModal} title={strings.confirmationButton} testID="mnemonicShowScreen::confirm" />
        </View>

        {modal && (
          <MnemonicBackupImportanceModal
            visible={modal}
            onConfirm={navigateToMnemonicCheck}
            onRequestClose={hideModal}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const messages = defineMessages({
  mnemonicNote: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.mnemonicNote',
    defaultMessage:
      '!!!Please, make sure you have carefully written down your ' +
      'recovery phrase somewhere safe. ' +
      'You will need this phrase to use and restore your wallet. ' +
      'Phrase is case sensitive.',
  },
  confirmationButton: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.confirmationButton',
    defaultMessage: '!!!Yes, I have written it down',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    mnemonicNote: intl.formatMessage(messages.mnemonicNote),
    confirmationButton: intl.formatMessage(messages.confirmationButton),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mnemonicNote: {
    paddingBottom: 16,
  },
  mnemonicWords: {
    backgroundColor: '#fff',
    borderColor: '#9B9B9B',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mnemonicText: {
    lineHeight: 30,
    marginRight: 24,
  },
  image: {
    paddingTop: 24,
    alignItems: 'center',
  },
  button: {
    padding: 16,
  },
})
