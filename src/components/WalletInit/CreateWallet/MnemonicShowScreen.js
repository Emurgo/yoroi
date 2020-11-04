// @flow

import React from 'react'
import {View, Image, Dimensions} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers, withProps} from 'recompose'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import assert from '../../../utils/assert'
import {Text, Button, StatusBar} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/MnemonicShowScreen.style'
import MnemonicBackupImportanceModal from './MnemonicBackupImportanceModal'
import recoveryPhrase from '../../../assets/img/recovery_phrase.png'

import {withNavigationTitle} from '../../../utils/renderUtils'
import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  mnemonicNote: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.mnemonicNote',
    defaultMessage:
      '!!!Please, make sure you have carefully written down your ' +
      'recovery phrase somewhere safe. ' +
      'You will need this phrase to use and restore your wallet. ' +
      'Phrase is case sensitive.',
    description: 'some desc',
  },
  confirmationButton: {
    id:
      'components.walletinit.createwallet.mnemonicshowscreen.confirmationButton',
    defaultMessage: '!!!Yes, I have written it down',
    description: 'some desc',
  },
})

const MnemonicShowScreen = ({
  navigateToMnemonicCheck,
  intl,
  mnemonic,
  modal,
  showModal,
  hideModal,
}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />
    <View style={styles.contentContainer}>
      <View>
        <Text>{intl.formatMessage(messages.mnemonicNote)}</Text>
        <View style={styles.mnemonicWordsContainer}>
          {mnemonic.split(' ').map((word, index) => (
            <Text
              key={index}
              style={styles.mnemonicText}
              testID={`mnemonic-${index}`}
            >
              {word}
            </Text>
          ))}
        </View>
      </View>
      {/* If screen is small hide image */}
      {Dimensions.get('window').height > 480 && (
        <View style={styles.image}>
          <Image source={recoveryPhrase} />
        </View>
      )}
      <View>
        <Button
          onPress={showModal}
          title={intl.formatMessage(messages.confirmationButton)}
          testID="mnemonicShowScreen::confirm"
        />
      </View>
    </View>

    {modal && (
      <MnemonicBackupImportanceModal
        visible={modal}
        onConfirm={navigateToMnemonicCheck}
        onRequestClose={hideModal}
      />
    )}
  </SafeAreaView>
)

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withProps((props) => ({mnemonic: props.route.params.mnemonic})),
    withStateHandlers(
      {
        modal: false,
      },
      {
        showModal: () => () => ({modal: true}),
        hideModal: () => () => ({modal: false}),
      },
    ),
    withHandlers({
      navigateToMnemonicCheck: ({
        navigation,
        route,
        hideModal,
        mnemonic,
      }) => () => {
        const {name, password, networkId, walletImplementationId} = route.params
        assert.assert(!!mnemonic, 'navigateToMnemonicCheck:: mnemonic')
        assert.assert(!!password, 'navigateToMnemonicCheck:: password')
        assert.assert(!!name, 'navigateToMnemonicCheck:: name')
        assert.assert(networkId != null, 'navigateToMnemonicCheck:: networkId')
        assert.assert(!!walletImplementationId, 'walletImplementationId')

        navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_CHECK, {
          mnemonic,
          password,
          name,
          networkId,
          walletImplementationId,
        })
        hideModal()
      },
    }),
  )(MnemonicShowScreen): ComponentType<{
    navigation: Navigation,
    route: Object, // TODO
    intl: intlShape,
  }>),
)
