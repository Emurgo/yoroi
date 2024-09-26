import {walletChecksum} from '@emurgo/cip4-js'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  InteractionManager,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {TextInput} from '../../../../components/TextInput/TextInput'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {debugWalletInfo, features} from '../../../../kernel/features'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {logger} from '../../../../kernel/logger/logger'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {isEmptyString} from '../../../../kernel/utils'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
} from '../../../../yoroi-wallets/utils/validators'
import {useCreateWalletMnemonic} from '../../../WalletManager/common/hooks/useCreateWalletMnemonic'
import {parseWalletMeta} from '../../../WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {useStrings} from '../../common/useStrings'
import {Info as InfoIcon} from '../../illustrations/Info'

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
const addressMode: Wallet.AddressMode = 'single'
export const RestoreWalletDetailsScreen = () => {
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {styles} = useStyles()
  const {track} = useMetrics()
  const bold = useBold()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
  const storage = useAsyncStorage()
  const {mnemonic, publicKeyHex, walletImplementation, walletIdChanged, accountVisual} = useSetupWallet()
  const plate = walletChecksum(publicKeyHex)

  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)

  const intl = useIntl()
  const {
    createWallet,
    isLoading,
    isSuccess: isCreateWalletSuccess,
  } = useCreateWalletMnemonic({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error('RestoreWalletDetailsScreen: wallet meta is invalid, reached an invalid state.')
        logger.error(error)
        throw error
      }

      track.restoreWalletDetailsSettled()

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const passwordErrorText =
    passwordErrors.passwordIsWeak && !isLoading
      ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
      : undefined
  const passwordConfirmationErrorText =
    passwordErrors.matchesConfirmation && !isLoading ? strings.repeatPasswordInputError : undefined

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  const nameErrors = !isCreateWalletSuccess ? walletManager.validateWalletName(name) : null
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
    nameErrors,
  )

  const disabled = isLoading || Object.keys(nameErrors ?? {}).length > 0 || Object.keys(passwordErrors).length > 0

  const showModalTipsPassword = () => {
    openModal(
      strings.walletDetailsModalTitle,
      <View style={[styles.flex, styles.modal]}>
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

        <Button title={strings.continueButton} shelleyTheme onPress={closeModal} />
      </View>,
      HEIGHT_MODAL_NAME_PASSWORD,
    )
  }

  const showModalTipsPlateNumber = () => {
    openModal(
      strings.walletDetailsModalTitle,
      <View style={[styles.flex, styles.modal]}>
        <ScrollView bounces={false}>
          <View>
            <CardAboutPhrase
              title={strings.walletChecksumModalCardTitle}
              checksumImage={plate.ImagePart}
              checksumLine={1}
              linesOfText={[
                strings.walletChecksumModalCardFirstItem,
                strings.walletChecksumModalCardSecondItem(plate.TextPart),
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

        <Button title={strings.continueButton} shelleyTheme onPress={closeModal} />
      </View>,
      HEIGHT_MODAL_CHECKSUM,
    )
  }

  return (
    <KeyboardAvoidingView style={[styles.root, styles.flex]}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeAreaView, styles.flex]}>
        <StepperProgress currentStep={2} currentStepTitle={strings.stepWalletDetails} totalSteps={2} />

        <View style={styles.info}>
          <Text style={styles.title}>{strings.walletDetailsTitle(bold)}</Text>

          <Info onPress={showModalTipsPassword} />
        </View>

        <Space height="xl" />

        <ScrollView style={styles.flex}>
          <TextInput
            enablesReturnKeyAutomatically
            autoFocus
            label={strings.walletDetailsNameInput}
            value={name}
            onChangeText={(walletName: string) => setName(walletName)}
            errorText={!isEmptyString(walletNameErrorText) && !isLoading ? walletNameErrorText : undefined}
            errorDelay={0}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="walletNameInput"
            autoComplete="off"
            showErrorOnBlur
          />

          <Space height="xl" />

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
            textContentType="oneTimeCode"
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
            textContentType="oneTimeCode"
          />

          <Space height="xl" />

          <View style={styles.checksum}>
            <Icon.WalletAvatar
              image={new Blockies({seed: plate.ImagePart}).asBase64()}
              style={styles.walletChecksum}
              size={24}
            />

            <Space width="sm" />

            <Text style={styles.plateNumber} testID="wallet-plate-number">
              {plate.TextPart}
            </Text>

            <Space width="sm" />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <View>
          <Button
            shelleyTheme
            title={strings.next}
            onPress={() =>
              createWallet({
                name,
                password,
                mnemonicPhrase: mnemonic,
                implementation: walletImplementation,
                addressMode,
                accountVisual,
              })
            }
            testID="setup-restore-step2-next-button"
            disabled={disabled}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Info = ({onPress}: {onPress: () => void}) => {
  const {color, isDark} = useTheme()
  return (
    <TouchableOpacity onPress={onPress}>
      <InfoIcon size={24} color={isDark ? color.white_static : color.black_static} />
    </TouchableOpacity>
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
    flex: {
      ...atoms.flex_1,
    },
    modal: {
      ...atoms.pb_lg,
      ...atoms.px_lg,
    },
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.justify_between,
      ...atoms.px_lg,
    },
    safeAreaView: {
      ...atoms.pb_lg,
    },
    info: {
      flexDirection: 'row',
    },
    title: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    plateNumber: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    checksum: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
      textAlignVertical: 'center',
    },
    walletChecksum: {
      width: 24,
      height: 24,
    },
  })

  return {styles} as const
}
