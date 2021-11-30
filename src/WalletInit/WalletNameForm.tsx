// @flow

import type {ReactNode} from 'react'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Image, SafeAreaView, View} from 'react-native'
import type {ImageSource} from 'react-native/Libraries/Image/ImageSource'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'
import {useSelector} from 'react-redux'

import {Button, ProgressStep, TextInput} from '../../legacy/components/UiKit'
import styles from '../../legacy/components/WalletInit/styles/WalletNameForm.style'
import {CONFIG} from '../../legacy/config/config'
import globalMessages from '../../legacy/i18n/global-messages'
import {walletNamesSelector} from '../../legacy/selectors'
import {ignoreConcurrentAsyncHandler} from '../../legacy/utils/utils'
import {getWalletNameError, validateWalletName} from '../../legacy/utils/validators'

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

type Props = {
  onSubmit: ({name: string}) => void
  defaultWalletName?: string
  image?: ImageSource
  progress?: {
    currentStep: number
    totalSteps: number
  }
  containerStyle?: ViewStyleProp
  buttonStyle?: ViewStyleProp
  topContent?: ReactNode
  bottomContent?: ReactNode
  isWaiting?: boolean
}

const WalletNameForm = ({
  onSubmit,
  image,
  progress,
  containerStyle,
  buttonStyle,
  topContent,
  bottomContent,
  isWaiting = false,
}: Props) => {
  const intl = useIntl()
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default WalletNameForm
