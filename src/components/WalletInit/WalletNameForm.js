// @flow

import React from 'react'
import {View, SafeAreaView, Image} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import {Button, ValidatedTextInput, ProgressStep} from '../UiKit'
import {getWalletNameError, validateWalletName} from '../../utils/validators'
import {withNavigationTitle} from '../../utils/renderUtils'
import globalMessages from '../../../src/i18n/global-messages'
import {walletNamesSelector} from '../../selectors'

import styles from './styles/WalletNameForm.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

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

const WalletNameForm = ({
  intl,
  onPress,
  name,
  image,
  validateForm,
  setName,
  progress,
}) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      {progress != null && (
        <ProgressStep
          currentStep={progress.currentStep}
          totalSteps={progress.totalSteps}
          displayStepNumber
        />
      )}
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heading}>
            {image != null && <Image source={image} />}
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
  onSubmit: ({name: string}) => PossiblyAsync<void>,
  defaultName?: string,
  image: string,
  progress?: {
    currentStep: number,
    totalSteps: number,
  },
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        walletNames: walletNamesSelector(state),
      }),
      {
        validateWalletName,
      },
    ),
    withStateHandlers(
      ({defaultWalletName = ''}) => ({name: defaultWalletName}),
      {
        setName: () => (name) => ({name}),
      },
    ),
    withHandlers({
      onPress: ({onSubmit, name}) => async () => {
        await onSubmit({name})
      },
      validateWalletName: ({walletNames}) => (walletName) =>
        validateWalletName(walletName, null, walletNames),
    }),
    withHandlers({
      validateForm: ({name, validateWalletName}) => () =>
        validateWalletName(name),
    }),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(WalletNameForm): ComponentType<ExternalProps>),
)
