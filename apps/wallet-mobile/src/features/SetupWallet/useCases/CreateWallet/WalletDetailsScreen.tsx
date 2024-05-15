import {useFocusEffect} from '@react-navigation/native'
import {NetworkError} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
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
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {useCreateWallet, usePlate, useWalletNames} from '../../../../yoroi-wallets/hooks'
import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../../../../yoroi-wallets/utils'
import {debugWalletInfo, features} from '../../..'
import {AddressMode} from '../../../WalletManager/common/types'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerContext'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

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
const addressMode: AddressMode = 'single'
export const WalletDetailsScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {resetToWalletSelection} = useWalletNavigation()
  const strings = useStrings()
  const walletManager = useWalletManager()
  const {walletNames} = useWalletNames(walletManager)
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletDetailsStepViewed()
    }, [track]),
  )

  const {mnemonic, networkId, publicKeyHex, walletImplementationId} = useSetupWallet()
  const plate = usePlate({networkId, publicKeyHex})

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
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.repeatPasswordInputError
    : undefined

  const intl = useIntl()
  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: () => {
      track.createWalletDetailsSettled()
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

  const handleCreateWallet = React.useCallback(() => {
    track.createWalletDetailsSubmitted()

    createWallet({
      name,
      password,
      mnemonicPhrase: mnemonic,
      networkId,
      walletImplementationId: walletImplementationId as WalletImplementationId,
      addressMode,
    })
  }, [createWallet, mnemonic, name, networkId, password, track, walletImplementationId])

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

            <Space height="lg" />

            <CardAboutPhrase
              title={strings.walletPasswordModalCardTitle}
              linesOfText={[strings.walletPasswordModalCardFirstItem, strings.walletPasswordModalCardSecondItem]}
            />

            <Space height="lg" />

            <LearnMoreButton
              onPress={() => {
                Linking.openURL(YoroiZendeskLink)
              }}
            />
          </View>
        </ScrollView>

        <Space height="sm" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="lg" />
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

            <Space height="lg" />

            <LearnMoreButton
              onPress={() => {
                Linking.openURL(YoroiZendeskLink)
              }}
            />
          </View>
        </ScrollView>

        <Space height="sm" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="lg" />
      </View>,
      HEIGHT_MODAL_CHECKSUM,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={4} currentStepTitle={strings.stepWalletDetails} totalSteps={4} />

        <Text style={styles.title}>
          {strings.walletDetailsTitle(bold)}

          <TouchableOpacity onPress={showModalTipsPassword}>
            <Icon.Info size={28} />
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

          <Space width="sm" />

          <Text style={styles.plateNumber}>
            {plate.accountPlate.TextPart}

            <Space width="sm" />

            <TouchableOpacity onPress={showModalTipsPlateNumber}>
              <Icon.Info size={28} />
            </TouchableOpacity>
          </Text>
        </View>
      </View>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          onPress={isLoading || isSuccess ? NOOP : () => handleCreateWallet()}
          disabled={Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
        />

        <Space height="sm" />
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.gray_cmin,
    },
    modal: {
      flex: 1,
    },
    title: {
      alignSelf: 'center',
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    plateNumber: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {backgroundColor: color.primary_c500},
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    checksum: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    walletChecksum: {width: 24, height: 24},
  })

  return {styles} as const
}

const NOOP = () => undefined
