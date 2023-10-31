/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Image, ImageSourcePropType, StyleSheet, View, ViewStyle} from 'react-native'

import {Button, KeyboardAvoidingView, ProgressStep, TextInput} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {spacing} from '../../theme'
import {useWalletManager} from '../../WalletManager'
import {useWalletNames} from '../../yoroi-wallets/hooks'
import {getWalletNameError, validateWalletName} from '../../yoroi-wallets/utils/validators'

type Props = {
  onSubmit: ({name}: {name: string}) => void
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
  defaultWalletName,
  isWaiting = false,
}: Props) => {
  const strings = useStrings()
  const [name, setName] = React.useState(defaultWalletName ?? '')
  const walletManager = useWalletManager()
  const {walletNames} = useWalletNames(walletManager)
  const validationErrors = validateWalletName(name, null, walletNames || [])
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorMessages = {
    tooLong: strings.walletNameErrorTooLong,
    nameAlreadyTaken: strings.walletNameErrorNameAlreadyTaken,
    mustBeFilled: strings.walletNameErrorMustBeFilled,
  }
  const walletNameErrorText = getWalletNameError(errorMessages, validationErrors) ?? undefined

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        notHiddenContent={
          <View style={styles.buttonContainer}>
            <Button
              block
              onPress={() => onSubmit({name: name.trim()})}
              title={strings.save}
              style={buttonStyle}
              disabled={hasErrors || isWaiting}
              testID="saveWalletButton"
            />
          </View>
        }
      >
        {progress != null && (
          <ProgressStep currentStep={progress.currentStep} totalSteps={progress.totalSteps} displayStepNumber />
        )}

        <View style={[styles.container, containerStyle]}>
          <View style={styles.heading}>{image != null && <Image source={image} />}</View>

          {topContent}

          <TextInput
            errorOnMount
            autoFocus
            label={strings.walletNameInputLabel}
            value={name}
            onChangeText={(walletName: string) => setName(walletName)}
            errorText={walletNameErrorText}
            disabled={isWaiting}
            autoComplete="off"
            testID="walletNameInput"
          />

          {bottomContent}
        </View>
      </KeyboardAvoidingView>

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
    padding: 16,
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
