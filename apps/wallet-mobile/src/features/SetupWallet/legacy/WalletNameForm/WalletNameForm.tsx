/* eslint-disable @typescript-eslint/no-explicit-any */
import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, Image, ImageSourcePropType, ScrollView, StyleSheet, View, ViewStyle} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {ProgressStep} from '../../../../components/ProgressStep'
import {TextInput} from '../../../../components/TextInput/TextInput'
import globalMessages from '../../../../kernel/i18n/global-messages'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {getWalletNameError, validateWalletName} from '../../../../yoroi-wallets/utils/validators'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'

type Props = {
  onSubmit: ({name}: {name: string}) => void
  defaultWalletName?: string
  image?: ImageSourcePropType
  progress?: {
    currentStep: number
    totalSteps: number
  }
  containerStyle?: ViewStyle
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  isWaiting?: boolean
}

export const WalletNameForm = ({
  onSubmit,
  image,
  progress,
  containerStyle,
  topContent,
  bottomContent,
  defaultWalletName,
  isWaiting = false,
}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [name, setName] = React.useState(defaultWalletName ?? '')
  const {track} = useMetrics()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(({name}) => name)
  const validationErrors = validateWalletName(name, null, walletNames)
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorMessages = {
    tooLong: strings.walletNameErrorTooLong,
    nameAlreadyTaken: strings.walletNameErrorNameAlreadyTaken,
    mustBeFilled: strings.walletNameErrorMustBeFilled,
  }
  const walletNameErrorText = getWalletNameError(errorMessages, validationErrors) ?? undefined

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        {progress != null && (
          <ProgressStep currentStep={progress.currentStep} totalSteps={progress.totalSteps} displayStepNumber />
        )}

        <ScrollView style={{flex: 1}} bounces={false}>
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
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => onSubmit({name: name.trim()})}
            title={strings.save}
            disabled={hasErrors || isWaiting}
            testID="saveWalletButton"
          />
        </View>

        {isWaiting && <ActivityIndicator color="black" />}
      </KeyboardAvoidingView>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    container: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      flex: 1,
    },
    heading: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 12,
    },
  })

  return styles
}

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
