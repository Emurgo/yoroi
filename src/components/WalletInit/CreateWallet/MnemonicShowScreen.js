// @flow

import React from 'react'
import {View, Image, ScrollView, Dimensions} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers, withProps} from 'recompose'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import assert from '../../../utils/assert'
import {Text, Button, StatusBar} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/MnemonicShowScreen.style'
import MnemonicBackupImportanceModal from './MnemonicBackupImportanceModal'
import recoveryPhrase from '../../../assets/img/recovery_phrase.png'

import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const messages = defineMessages({
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

const MnemonicShowScreen = (
  {
    navigateToMnemonicCheck,
    intl,
    mnemonic,
    modal,
    showModal,
    hideModal,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => (
  <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <View style={styles.content}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        bounces={false}
      >
        <View style={styles.mnemonicNote}>
          <Text>{intl.formatMessage(messages.mnemonicNote)}</Text>
        </View>

        <View style={styles.mnemonicWords}>
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

        {/* If screen is small hide image */}
        {Dimensions.get('window').height > 480 && (
          <View style={styles.image}>
            <Image source={recoveryPhrase} />
          </View>
        )}
      </ScrollView>

      <View style={styles.button}>
        <Button
          onPress={showModal}
          title={intl.formatMessage(messages.confirmationButton)}
          testID="mnemonicShowScreen::confirm"
        />
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

export default injectIntl(
  (compose(
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
    intl: IntlShape,
  }>),
)
