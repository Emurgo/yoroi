import {walletChecksum} from '@emurgo/cip4-js'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  InteractionManager,
  Linking,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../../../kernel/dialogs'
import {debugWalletInfo, features} from '../../../../kernel/features'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {logger} from '../../../../kernel/logger/logger'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Button} from '../../../../ui/Button/Button'
import {CardAboutPhrase} from '../../../../ui/CardAboutPhrase/CardAboutPhrase'
import {Icon} from '../../../../ui/Icon'
import {KeyboardAvoidingView} from '../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LearnMoreButton} from '../../../../ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {Space} from '../../../../ui/Space/Space'
import {StepperProgress} from '../../../../ui/StepperProgress/StepperProgress'
import {TextInput} from '../../../../ui/TextInput/TextInput'
import {isEmptyString} from '../../../../wallets/utils/string'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
} from '../../../../wallets/utils/validators'
import {parseWalletMeta} from '../../../WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useCreateWalletMnemonic} from '../../../WalletManager/hooks/useCreateWalletMnemonic'
import {YoroiZendeskLink} from '../../common/constants'
import {useStrings} from '../../common/useStrings'
import {Info as InfoIcon} from '../../illustrations/Info'

const useSizeModal = () => {
  const HEIGHT_SCREEN = useWindowDimensions().height
  const mediumScreenHeight = 800
  const largerScreenHeight = 900
  const PERCENTAGE_NAME_PASSWORD =
    HEIGHT_SCREEN >= largerScreenHeight
      ? 58
      : HEIGHT_SCREEN >= mediumScreenHeight
        ? 65
        : 85
  const PERCENTAGE_CHECKSUM =
    HEIGHT_SCREEN >= largerScreenHeight
      ? 48
      : HEIGHT_SCREEN >= mediumScreenHeight
        ? 55
        : 75

  const HEIGHT_MODAL_CHECKSUM = (HEIGHT_SCREEN / 100) * PERCENTAGE_CHECKSUM
  const HEIGHT_MODAL_NAME_PASSWORD =
    (HEIGHT_SCREEN / 100) * PERCENTAGE_NAME_PASSWORD

  return {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} as const
}

// when restoring, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const RestoreWalletDetailsScreen = () => {
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {track} = useMetrics()
  const bold = useBold()
  // const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const [name, setName] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '',
  )
  const storage = useAsyncStorage()
  const {
    mnemonic,
    publicKeyHex,
    walletImplementation,
    walletIdChanged,
    accountVisual,
  } = useSetupWallet()
  const plate = walletChecksum(publicKeyHex)

  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)

  const intl = useIntl()
  const {
    createWallet,
    isPending,
    isSuccess: isCreateWalletSuccess,
  } = useCreateWalletMnemonic({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error(
          'RestoreWalletDetailsScreen: wallet meta is invalid, reached an invalid state.',
        )
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
          : showErrorDialog(errorMessages.generalError, intl, {
              message: error.message,
            })
      })
    },
  })

  const passwordErrorText =
    passwordErrors.passwordIsWeak && !isPending
      ? strings.passwordStrengthRequirement({
          requiredPasswordLength: REQUIRED_PASSWORD_LENGTH,
        })
      : undefined
  const passwordConfirmationErrorText =
    passwordErrors.matchesConfirmation && !isPending
      ? strings.repeatPasswordInputError
      : undefined

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  const nameErrors = !isCreateWalletSuccess
    ? walletManager.validateWalletName(name)
    : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.tooLong,
      nameAlreadyTaken: strings.nameAlreadyTaken,
      mustBeFilled: strings.mustBeFilled,
    },
    nameErrors,
  )

  const disabled =
    isPending ||
    Object.keys(nameErrors ?? {}).length > 0 ||
    Object.keys(passwordErrors).length > 0

  const showModalTipsPassword = () => {
    openModal({
      // title: strings.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.pb_lg, a.px_lg]}>
          <CardAboutPhrase
            title={strings.walletNameModalCardTitle}
            linesOfText={[
              strings.walletNameModalCardFirstItem,
              strings.walletNameModalCardSecondItem,
            ]}
          />

          <Space.Height.lg />

          <CardAboutPhrase
            title={strings.walletPasswordModalCardTitle}
            linesOfText={[
              strings.walletPasswordModalCardFirstItem,
              strings.walletPasswordModalCardSecondItem,
            ]}
          />

          <Space.Height.lg />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />
        </View>
      ),
      // footer: <Button title={strings.continueButton} onPress={closeModal} />,
      // height: HEIGHT_MODAL_NAME_PASSWORD,
    })
  }

  const showModalTipsPlateNumber = () => {
    openModal({
      // title: strings.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.pb_lg, a.px_lg]}>
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

          <Space.Height.lg />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />
        </View>
      ),
      // footer: <Button title={strings.continueButton} onPress={closeModal} />,
      // height: HEIGHT_MODAL_CHECKSUM,
    })
  }

  return (
    <KeyboardAvoidingView
      style={[
        {backgroundColor: p.bg_color_max},
        a.justify_between,
        a.px_lg,
        a.flex_1,
      ]}
    >
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={[a.pb_lg, a.flex_1]}
      >
        <StepperProgress
          currentStep={2}
          currentStepTitle={strings.stepWalletDetails}
          totalSteps={2}
        />

        <View style={a.flex_row}>
          <Text
            style={[
              {
                color: p.text_gray_medium,
              },
              a.body_1_lg_regular,
            ]}
          >
            {strings.walletDetailsTitle(bold)}
          </Text>

          <Info onPress={showModalTipsPassword} />
        </View>

        <Space.Height.xl />

        <ScrollView style={a.flex_1}>
          <TextInput
            enablesReturnKeyAutomatically
            autoFocus
            label={strings.walletDetailsNameInput}
            value={name}
            onChangeText={(walletName: string) => setName(walletName)}
            errorText={
              !isEmptyString(walletNameErrorText) && !isPending
                ? walletNameErrorText
                : undefined
            }
            errorDelay={0}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="walletNameInput"
            autoComplete="off"
            showErrorOnBlur
          />

          <Space.Height.xl />

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

          <Space.Height.xl />

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

          <Space.Height.xl />

          <View style={[a.flex_row, a.align_center, a.justify_center]}>
            <Icon.WalletAvatar
              image={new Blockies({seed: plate.ImagePart}).asBase64()}
              style={{
                width: 24,
                height: 24,
              }}
              size={24}
            />

            <Space.Height.sm />

            <Text
              style={[
                {
                  color: p.text_gray_medium,
                },
                a.body_1_lg_regular,
                a.text_center,
                a.justify_center,
                a.align_center,
              ]}
              testID="wallet-plate-number"
            >
              {plate.TextPart}
            </Text>

            <Space.Height.sm />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <View>
          <Button
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
  const {palette: p, isDark} = useTheme()
  return (
    <TouchableOpacity onPress={onPress}>
      <InfoIcon size={24} color={isDark ? p.white_static : p.black_static} />
    </TouchableOpacity>
  )
}

const useBold = () => {
  return {
    b: (text: React.ReactNode) => (
      <Text style={a.body_1_lg_medium}>{text}</Text>
    ),
  }
}
