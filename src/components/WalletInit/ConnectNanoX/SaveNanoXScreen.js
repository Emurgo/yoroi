// @flow

import React from 'react'
import {View, SafeAreaView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import {Button, ValidatedTextInput, ProgressStep} from '../../UiKit'
import {getWalletNameError, validateWalletName} from '../../../utils/validators'
import {withNavigationTitle} from '../../../utils/renderUtils'
import globalMessages from '../../../../src/i18n/global-messages'
import {walletNamesSelector} from '../../../selectors'
import {createWalletWithBip44Account, saveHW} from '../../../actions'
import {ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config'
import assert from '../../../utils/assert'

import styles from './styles/SaveNanoXScreen.style'
import image from '../../../assets/img/ledger_2.png'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Save wallet',
  },
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
  },
  save: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.save',
    defaultMessage: '!!!Save',
  },
})

const SaveNanoXScreen = ({
  intl,
  onPress,
  name,
  validateForm,
  validateWalletName,
  setName,
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={3} totalSteps={3} displayStepNumber />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Image source={image} />
          </View>
          <ValidatedTextInput
            label={intl.formatMessage(messages.walletNameInputLabel)}
            value={name}
            onChangeText={setName}
            error={getWalletNameError(
              {
                tooLong: intl.formatMessage(
                  globalMessages.walletNameErrorTooLong,
                ),
                nameAlreadyTaken: intl.formatMessage(
                  globalMessages.walletNameErrorNameAlreadyTaken,
                ),
              },
              validateForm(),
            )}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          block
          onPress={onPress}
          title={intl.formatMessage(messages.save)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  intl: intlShape,
  navigation: Navigation,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        walletNames: walletNamesSelector(state),
      }),
      {
        validateWalletName,
        createWalletWithBip44Account,
        saveHW,
      },
    ),
    withStateHandlers(
      {
        name: CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME,
      },
      {
        setName: () => (name) => ({name}),
      },
    ),
    withHandlers({
      validateWalletName: ({walletNames}) => (walletName) =>
        validateWalletName(walletName, null, walletNames),
      onPress: ({
        createWalletWithBip44Account,
        saveHW,
        name,
        navigation,
      }) => async () => {
        const hwDeviceInfo = navigation.getParam('hwDeviceInfo')
        assert.assert(
          hwDeviceInfo != null,
          'SaveNanoXScreen::onPress hwDeviceInfo',
        )
        await createWalletWithBip44Account(
          name,
          hwDeviceInfo.bip44AccountPublic,
          hwDeviceInfo,
          false, // not Shelley
        )
        navigation.navigate(ROOT_ROUTES.WALLET)
        saveHW(hwDeviceInfo)
      },
    }),
    withHandlers({
      validateForm: ({name, validateWalletName}) => () =>
        validateWalletName(name),
    }),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(SaveNanoXScreen): ComponentType<ExternalProps>),
)
