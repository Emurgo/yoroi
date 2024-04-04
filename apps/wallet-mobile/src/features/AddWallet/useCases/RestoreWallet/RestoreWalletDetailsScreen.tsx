import {NetworkError} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  InteractionManager,
  Keyboard,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, TextInput, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {debugWalletInfo, features} from '../../../../features'
import {errorMessages} from '../../../../i18n/global-messages'
import {useWalletNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {AddressMode} from '../../../../wallet-manager/types'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import {useCreateWallet, usePlate, useWalletNames} from '../../../../yoroi-wallets/hooks'
import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../../../../yoroi-wallets/utils'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useWalletSetup} from '../../common/translators/reactjs/hooks/useWalletSetup'
import {useStrings} from '../../common/useStrings'
import {Info as InfoIllustration} from '../../illustrations/Info'

const useSizeModal = () => {
  const HEIGHT_SCREEN = useWindowDimensions().height
  const mediumScreenHeight = 800
  const largerScreenHeight = 900
  const PERCENTAGE_NAME_PASSWORD =
    HEIGHT_SCREEN >= largerScreenHeight ? 58 : HEIGHT_SCREEN >= mediumScreenHeight ? 65 : 85
  const PERCENTAGE_CHECKSUM = HEIGHT_SCREEN >= largerScreenHeight ? 48 : HEIGHT_SCREEN >= mediumScreenHeight ? 55 : 75

  const HEIGHT_MODAL_CHECKSUM = (HEIGHT_SCREEN / 100) * PERCENTAGE_CHECKSUM
  const HEIGHT_MODAL_NAME_PASSWORD = (HEIGHT_SCREEN / 100) * PERCENTAGE_NAME_PASSWORD

  return {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} as const
}

// when restoring, later will be part of the onboarding
const addressMode: AddressMode = 'multiple'
export const RestoreWalletDetailsScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const walletManager = useWalletManager()
  const {walletNames} = useWalletNames(walletManager)
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
  const nameErrors = validateWalletName(name, null, walletNames ?? [])
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
    nameErrors,
  )

  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)

  const {mnemonic, networkId, publicKeyHex, walletImplementationId} = useWalletSetup()
  const plate = usePlate({networkId, publicKeyHex})

  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.repeatPasswordInputError
    : undefined

  const intl = useIntl()
  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: () => {
      resetToWalletSelection()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const showModalTipsPassword = () => {
    Keyboard.dismiss()
    openModal(
      strings.walletDetailsModalTitle,
      <View style={styles.modal}>
        <ScrollView bounces={false}>
          <View>
            <CardAboutPhrase
              title={strings.walletNameModalCardTitle}
              linesOfText={[strings.walletNameModalCardFirstItem, strings.walletNameModalCardSecondItem]}
            />

            <Space height="l" />

            <CardAboutPhrase
              title={strings.walletPasswordModalCardTitle}
              linesOfText={[strings.walletPasswordModalCardFirstItem, strings.walletPasswordModalCardSecondItem]}
            />

            <Space height="l" />

            <LearnMoreButton
              onPress={() => {
                Linking.openURL(YoroiZendeskLink)
              }}
            />
          </View>
        </ScrollView>

        <Space height="s" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="l" />
      </View>,
      HEIGHT_MODAL_NAME_PASSWORD,
    )
  }

  const showModalTipsPlateNumber = () => {
    Keyboard.dismiss()
    openModal(
      strings.walletDetailsModalTitle,
      <View style={styles.modal}>
        <ScrollView bounces={false}>
          <View>
            <CardAboutPhrase
              title={strings.walletChecksumModalCardTitle}
              checksumImage={plate.accountPlate.ImagePart}
              checksumLine={1}
              linesOfText={[
                strings.walletChecksumModalCardFirstItem,
                strings.walletChecksumModalCardSecondItem,
                strings.walletChecksumModalCardThirdItem,
              ]}
            />

            <Space height="l" />

            <LearnMoreButton
              onPress={() => {
                Linking.openURL(YoroiZendeskLink)
              }}
            />
          </View>
        </ScrollView>

        <Space height="s" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="l" />
      </View>,
      HEIGHT_MODAL_CHECKSUM,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={2} currentStepTitle={strings.stepWalletDetails} totalSteps={2} />

        <Text style={styles.title}>
          {strings.walletDetailsTitle(bold)}

          <TouchableOpacity onPress={showModalTipsPassword}>
            <InfoIllustration />
          </TouchableOpacity>
        </Text>

        <Space height="xl" />

        <TextInput
          enablesReturnKeyAutomatically
          autoFocus
          label={strings.walletDetailsNameInput}
          value={name}
          onChangeText={(walletName: string) => setName(walletName)}
          errorText={!isEmptyString(walletNameErrorText) ? walletNameErrorText : undefined}
          errorDelay={0}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="walletNameInput"
          autoComplete="off"
          showErrorOnBlur
        />

        <TextInput
          enablesReturnKeyAutomatically
          ref={passwordRef}
          secureTextEntry
          label={strings.walletDetailsPasswordInput}
          value={password}
          onChangeText={setPassword}
          errorText={passwordErrorText}
          returnKeyType="next"
          helper={strings.walletDetailsPasswordHelper}
          onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
          testID="walletPasswordInput"
          autoComplete="off"
          showErrorOnBlur
        />

        <Space height="xl" />

        <TextInput
          enablesReturnKeyAutomatically
          ref={passwordConfirmationRef}
          secureTextEntry
          returnKeyType="done"
          label={strings.walletDetailsConfirmPasswordInput}
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          errorText={passwordConfirmationErrorText}
          testID="walletRepeatPasswordInput"
          autoComplete="off"
          showErrorOnBlur
        />

        <View style={styles.checksum}>
          <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

          <Space width="s" />

          <Text style={styles.plateNumber}>
            {plate.accountPlate.TextPart}

            <Space width="s" />

            <TouchableOpacity onPress={showModalTipsPlateNumber}>
              <InfoIllustration />
            </TouchableOpacity>
          </Text>
        </View>
      </View>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          onPress={
            isLoading || isSuccess
              ? NOOP
              : () =>
                  createWallet({
                    name,
                    password,
                    mnemonicPhrase: mnemonic,
                    networkId,
                    walletImplementationId: walletImplementationId as WalletImplementationId,
                    addressMode,
                  })
          }
          disabled={Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
        />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...theme.padding['x-l'],
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    modal: {
      flex: 1,
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    plateNumber: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {backgroundColor: theme.color.primary[500]},
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
    checksum: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
    },
    walletChecksum: {width: 24, height: 24},
  })

  return {styles} as const
}

const NOOP = () => undefined
