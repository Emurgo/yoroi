import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  View,
  ViewStyle,
} from 'react-native'

import {defineMessages, useIntl} from 'react-intl'
import globalMessages from '../../../../kernel/i18n/global-messages'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Button} from '../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {TextInput} from '../../../../ui/TextInput/TextInput'
import {
  getWalletNameError,
  validateWalletName,
} from '../../../../wallets/utils/validators'
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
  const {palette: p} = useTheme()
  const [name, setName] = React.useState(defaultWalletName ?? '')
  const {track} = useMetrics()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(
    ({name}) => name,
  )
  const validationErrors = validateWalletName(name, null, walletNames)
  const hasErrors = Object.keys(validationErrors).length > 0
  const errorMessages = {
    tooLong: strings.walletNameErrorTooLong,
    nameAlreadyTaken: strings.walletNameErrorNameAlreadyTaken,
    mustBeFilled: strings.walletNameErrorMustBeFilled,
  }
  const walletNameErrorText =
    getWalletNameError(errorMessages, validationErrors) ?? undefined

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  return (
    <View style={[{flex: 1}, {backgroundColor: p.bg_color_max}]}>
      <KeyboardAvoidingView style={{flex: 1}}>
        {progress != null && (
          <ProgressStep
            currentStep={progress.currentStep}
            totalSteps={progress.totalSteps}
            displayStepNumber
          />
        )}

        <ScrollView style={{flex: 1}} bounces={false}>
          <View
            style={[
              {paddingVertical: 24, paddingHorizontal: 16, flex: 1},
              containerStyle,
            ]}
          >
            <View
              style={[
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                },
              ]}
            >
              {image != null && <Image source={image} />}
            </View>

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

        <View style={[{flexDirection: 'row', marginTop: 12}]}>
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
    walletNameErrorTooLong: intl.formatMessage(
      globalMessages.walletNameErrorTooLong,
    ),
    walletNameErrorNameAlreadyTaken: intl.formatMessage(
      globalMessages.walletNameErrorNameAlreadyTaken,
    ),
    walletNameErrorMustBeFilled: intl.formatMessage(
      globalMessages.walletNameErrorMustBeFilled,
    ),
  }
}
