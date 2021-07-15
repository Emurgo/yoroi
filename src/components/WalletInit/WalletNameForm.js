// @flow

import React from 'react'
import {View, SafeAreaView, Image, ActivityIndicator} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {useSelector} from 'react-redux'
import {CONFIG} from '../../config/config'

import {Button, TextInput, ProgressStep} from '../UiKit'
import {getWalletNameError, validateWalletName} from '../../utils/validators'
import globalMessages from '../../../src/i18n/global-messages'
import {walletNamesSelector} from '../../selectors'
import {ignoreConcurrentAsyncHandler} from '../../utils/utils'

import styles from './styles/WalletNameForm.style'

import type {TextStyleProp, ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource'

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

type Props = {|
  intl: IntlShape,
  onSubmit: ({name: string}) => any,
  defaultWalletName?: string,
  image?: ImageSource,
  progress?: {
    currentStep: number,
    totalSteps: number,
  },
  containerStyle?: ViewStyleProp,
  buttonStyle?: TextStyleProp,
  topContent?: React$Node,
  bottomContent?: React$Node,
  isWaiting?: boolean,
|}

const WalletNameForm = ({
  intl,
  onSubmit,
  image,
  progress,
  containerStyle,
  buttonStyle,
  topContent,
  bottomContent,
  isWaiting = false,
}: Props) => {
  const [name, setName] = React.useState(CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME || '')
  const walletNames = useSelector(walletNamesSelector)
  const validationErrors = validateWalletName(name, null, walletNames)
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorMessages = {
    tooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    nameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    mustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
  }
  const walletNameErrorText = getWalletNameError(errorMessages, validationErrors) || undefined

  const submit = React.useCallback(ignoreConcurrentAsyncHandler(() => () => onSubmit({name}), 1000)(), [onSubmit, name])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {progress != null && (
        <ProgressStep currentStep={progress.currentStep} totalSteps={progress.totalSteps} displayStepNumber />
      )}

      <View style={[styles.container, containerStyle]}>
        <View style={styles.heading}>{image != null && <Image source={image} />}</View>

        {topContent}

        <TextInput
          autoFocus
          label={intl.formatMessage(messages.walletNameInputLabel)}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText}
          disabled={isWaiting}
        />

        {bottomContent}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          block
          onPress={submit}
          title={intl.formatMessage(messages.save)}
          style={[styles.button, buttonStyle]}
          disabled={hasErrors || isWaiting}
          testID="saveWalletButton"
        />
      </View>

      {isWaiting ? <ActivityIndicator /> : null}
    </SafeAreaView>
  )
}

export default injectIntl(WalletNameForm)
