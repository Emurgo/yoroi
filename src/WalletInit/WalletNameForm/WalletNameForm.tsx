/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Image, ImageSourcePropType, StyleSheet, View, ViewStyle} from 'react-native'

import {Button, ProgressStep, TextInput} from '../../components'
import {useWalletNames} from '../../hooks'
import globalMessages from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {ignoreConcurrentAsyncHandler} from '../../legacy/utils'
import {spacing} from '../../theme'
import {getWalletNameError, validateWalletName} from '../../yoroi-wallets/utils/validators'

type Props = {
  onSubmit: ({name: string}) => void
  defaultWalletName?: string
  image?: ImageSourcePropType
  progress?: {
    currentStep: number
    totalSteps: number
  }
  containerStyle?: ViewStyle
  buttonStyle?: ViewStyle
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  isWaiting?: boolean
}

export const WalletNameForm = ({
  onSubmit,
  image,
  progress,
  containerStyle,
  buttonStyle,
  topContent,
  bottomContent,
  isWaiting = false,
}: Props) => {
  const strings = useStrings()
  const [name, setName] = React.useState(CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME || '')
  const walletNames = useWalletNames()
  const validationErrors = validateWalletName(name, null, walletNames || [])
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorMessages = {
    tooLong: strings.walletNameErrorTooLong,
    nameAlreadyTaken: strings.walletNameErrorNameAlreadyTaken,
    mustBeFilled: strings.walletNameErrorMustBeFilled,
  }
  const walletNameErrorText = getWalletNameError(errorMessages, validationErrors) || undefined

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const submit = React.useCallback((ignoreConcurrentAsyncHandler as any)(() => () => onSubmit({name}), 1000)(), [
    onSubmit,
    name,
  ])

  return (
    <View style={styles.root}>
      {progress != null && (
        <ProgressStep currentStep={progress.currentStep} totalSteps={progress.totalSteps} displayStepNumber />
      )}

      <View style={[styles.container, containerStyle]}>
        <View style={styles.heading}>{image != null && <Image source={image} />}</View>

        {topContent}

        <TextInput
          autoFocus
          label={strings.walletNameInputLabel}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText}
          disabled={isWaiting}
          autoComplete={false}
        />

        {bottomContent}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          block
          onPress={submit}
          title={strings.save}
          style={[styles.button, buttonStyle]}
          disabled={hasErrors || isWaiting}
          testID="saveWalletButton"
        />
      </View>

      {isWaiting && <ActivityIndicator color="black" />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    flex: 1,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
    marginVertical: 16,
  },
})

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

const useStrings = () => {
  const intl = useIntl()

  return {
    walletNameInputLabel: intl.formatMessage(messages.walletNameInputLabel),
    save: intl.formatMessage(messages.save),
    walletNameErrorTooLong: intl.formatMessage(globalMessages.walletNameErrorTooLong),
    walletNameErrorNameAlreadyTaken: intl.formatMessage(globalMessages.walletNameErrorNameAlreadyTaken),
    walletNameErrorMustBeFilled: intl.formatMessage(globalMessages.walletNameErrorMustBeFilled),
  }
}
