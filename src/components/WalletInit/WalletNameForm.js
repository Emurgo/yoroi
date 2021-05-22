// @flow

import React from 'react'
import {View, SafeAreaView, Image, ActivityIndicator} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {isEmpty} from 'lodash'

import {Button, ValidatedTextInput, ProgressStep} from '../UiKit'
import {getWalletNameError, validateWalletName} from '../../utils/validators'
import globalMessages from '../../../src/i18n/global-messages'
import {walletNamesSelector} from '../../selectors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/WalletNameForm.style'

import type {ComponentType} from 'react'
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

const messages = defineMessages({
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
  containerStyle,
  buttonStyle,
  topContent,
  bottomContent,
  isWaiting = false,
}: {intl: IntlShape} & Object) => {
  const validationErrors = validateForm()
  return (
    <SafeAreaView style={styles.safeAreaView}>
      {progress != null && (
        <ProgressStep
          currentStep={progress.currentStep}
          totalSteps={progress.totalSteps}
          displayStepNumber
        />
      )}
      <View style={[styles.container, containerStyle]}>
        <View style={styles.heading}>
          {image != null && <Image source={image} />}
        </View>
        {topContent}
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
            validationErrors,
          )}
        />
        {bottomContent}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          block
          onPress={onPress}
          title={intl.formatMessage(messages.save)}
          style={[styles.button, buttonStyle]}
          disabled={!isEmpty(validationErrors)}
          testID="saveWalletButton"
        />
      </View>
      {isWaiting === true && <ActivityIndicator />}
    </SafeAreaView>
  )
}

type ExternalProps = {|
  intl: IntlShape,
  onSubmit: ({name: string}) => PossiblyAsync<void>,
  defaultName?: string,
  image: string,
  progress?: {
    currentStep: number,
    totalSteps: number,
  },
  containerStyle?: TextStyleProp,
  buttonStyle?: TextStyleProp,
  topContent?: React$Node,
  bottomContent?: React$Node,
  isWaiting?: boolean,
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
      onPress: ignoreConcurrentAsyncHandler(
        ({onSubmit, name}) => async () => {
          await onSubmit({name})
        },
        1000,
      ),
      validateWalletName: ({walletNames}) => (walletName) =>
        validateWalletName(walletName, null, walletNames),
    }),
    withHandlers({
      validateForm: ({name, validateWalletName}) => () =>
        validateWalletName(name),
    }),
  )(WalletNameForm): ComponentType<ExternalProps>),
)
