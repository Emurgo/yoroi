import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'
import * as React from 'react'
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
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {YoroiZendeskLink} from '~/features/SetupWallet/common/constants'
import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateWalletMnemonic} from '~/features/WalletManager/hooks/useCreateWalletMnemonic'
import {showErrorDialog} from '~/kernel/dialogs'
import {debugWalletInfo, features} from '~/kernel/features'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {Icon} from '~/ui/Icon'
import {Info as InfoIcon} from '~/ui/InfoIcon/InfoIcon'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '~/wallets/utils/validators'

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
export const WalletDetailsScreen = () => {
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {track} = useMetrics()
  const bold = useBold()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(
    ({name}) => name,
  )

  const storage = useAsyncStorage()
  const {
    mnemonic,
    publicKeyHex,
    walletImplementation,
    showRestoreWalletInfoModal,
    showRestoreWalletInfoModalChanged,
    walletIdChanged,
    accountVisual,
  } = useSetupWallet()
  const {plate, seed} = walletManager.checksum(publicKeyHex)
  const [name, setName] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '',
  )
  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletDetailsStepViewed()
    }, [track]),
  )

  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const [passwordConfirmation, setPasswordConfirmation] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '',
  )
  const passwordErrors = validatePassword(password, passwordConfirmation)

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
          'WalletDetailsScreen: wallet meta is invalid, reached an invalid state.',
        )
        logger.error(error)
        throw error
      }

      track.createWalletDetailsSettled()

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(strings.global.networkError)
          : showErrorDialog(strings.global.generalError, {
              message: error.message,
            })
      })
    },
  })

  const passwordErrorText =
    passwordErrors.passwordIsWeak && !isPending
      ? strings.setupWallet.passwordStrengthRequirement({
          requiredPasswordLength: REQUIRED_PASSWORD_LENGTH,
        })
      : undefined
  const passwordConfirmationErrorText =
    passwordErrors.matchesConfirmation && !isPending
      ? strings.setupWallet.repeatPasswordInputError
      : undefined

  const nameErrors = validateWalletName(
    name,
    null,
    !isCreateWalletSuccess ? walletNames : [],
  )
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
      mustBeFilled: strings.setupWallet.mustBeFilled,
    },
    nameErrors,
  )

  const handleCreateWallet = React.useCallback(() => {
    track.createWalletDetailsSubmitted()

    createWallet({
      name,
      password,
      mnemonicPhrase: mnemonic,
      implementation: walletImplementation,
      addressMode,
      accountVisual,
    })
  }, [
    accountVisual,
    createWallet,
    mnemonic,
    name,
    password,
    track,
    walletImplementation,
  ])

  const showModalTipsPassword = React.useCallback(() => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.px_lg, a.pb_lg]}>
          <View style={[a.gap_lg]}>
            <CardAboutPhrase
              title={strings.setupWallet.walletNameModalCardTitle}
              linesOfText={[
                strings.setupWallet.walletNameModalCardFirstItem,
                strings.setupWallet.walletNameModalCardSecondItem,
              ]}
            />

            <CardAboutPhrase
              title={strings.setupWallet.walletPasswordModalCardTitle}
              linesOfText={[
                strings.setupWallet.walletPasswordModalCardFirstItem,
                strings.setupWallet.walletPasswordModalCardSecondItem,
              ]}
            />
          </View>
        </View>
      ),
      footer: (
        <View style={[a.px_lg, a.pb_lg, a.gap_lg]}>
          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />

          <Button
            title={strings.setupWallet.continueButton}
            onPress={() => {
              closeModal()
              showRestoreWalletInfoModalChanged(false)
            }}
            testID="setup-modal-continue-button"
          />
        </View>
      ),
      height: HEIGHT_MODAL_NAME_PASSWORD,
    })
  }, [
    openModal,
    strings.setupWallet.walletNameModalCardFirstItem,
    strings.setupWallet.walletNameModalCardSecondItem,
    strings.setupWallet.walletNameModalCardTitle,
    strings.setupWallet.walletPasswordModalCardFirstItem,
    strings.setupWallet.walletPasswordModalCardSecondItem,
    strings.setupWallet.walletPasswordModalCardTitle,
    closeModal,
    showRestoreWalletInfoModalChanged,
  ])

  React.useEffect(() => {
    if (showRestoreWalletInfoModal) showModalTipsPassword()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRestoreWalletInfoModal])

  const showModalTipsPlateNumber = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.px_lg, a.pb_lg]}>
          <CardAboutPhrase
            title={strings.setupWallet.walletChecksumModalCardTitle}
            checksumImage={seed}
            checksumLine={1}
            linesOfText={[
              strings.setupWallet.walletChecksumModalCardFirstItem,
              strings.setupWallet.walletChecksumModalCardSecondItem(plate),
              strings.setupWallet.walletChecksumModalCardThirdItem,
            ]}
          />
        </View>
      ),
      footer: (
        <View style={[a.px_lg, a.pb_lg, a.gap_lg]}>
          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />

          <Button title={strings.setupWallet.continueButton} onPress={closeModal} />
        </View>
      ),
      height: HEIGHT_MODAL_CHECKSUM,
    })
  }

  return (
    <KeyboardAvoidingView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={[a.flex_1, a.pb_lg]}
      >
        <StepperProgress
          style={[a.px_lg]}
          currentStep={4}
          currentStepTitle={strings.setupWallet.stepWalletDetails}
          totalSteps={4}
        />

        <View style={[{height: 24}, a.px_lg, a.flex_row]}>
          <Text
            style={[
              {color: p.text_gray_medium},
              a.self_center,
              a.body_1_lg_regular,
            ]}
          >
            {strings.setupWallet.walletDetailsTitle(bold)}
          </Text>

          <Info onPress={showModalTipsPassword} />
        </View>

        <ScrollView style={a.px_lg} contentContainerStyle={[a.pt_lg, a.gap_lg]}>
          <TextInput
            enablesReturnKeyAutomatically
            autoFocus={!showRestoreWalletInfoModal}
            label={strings.setupWallet.walletDetailsNameInput}
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

          <TextInput
            enablesReturnKeyAutomatically
            ref={passwordRef}
            secureTextEntry
            label={strings.setupWallet.walletDetailsPasswordInput}
            value={password}
            onChangeText={setPassword}
            errorText={passwordErrorText}
            returnKeyType="next"
            helper={strings.setupWallet.walletDetailsPasswordHelper}
            onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
            testID="walletPasswordInput"
            autoComplete="off"
            showErrorOnBlur
            textContentType="oneTimeCode"
          />

          <TextInput
            enablesReturnKeyAutomatically
            ref={passwordConfirmationRef}
            secureTextEntry
            returnKeyType="done"
            label={strings.setupWallet.walletDetailsConfirmPasswordInput}
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            errorText={passwordConfirmationErrorText}
            testID="walletRepeatPasswordInput"
            autoComplete="off"
            showErrorOnBlur
            textContentType="oneTimeCode"
          />

          <View
            style={[
              a.flex_row,
              a.align_center,
              a.justify_center,
              a.align_center,
            ]}
          >
            <Icon.WalletAvatar
              image={new Blockies({seed}).asBase64()}
              style={{width: 24, height: 24}}
              size={24}
            />

            <Space.Width.sm />

            <Text
              style={[
                {color: p.text_gray_medium},
                a.body_1_lg_regular,
                a.text_center,
                a.justify_center,
                a.align_center,
              ]}
            >
              {plate}
            </Text>

            <Space.Width.sm />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <Actions style={a.px_lg}>
          <Button
            title={strings.setupWallet.next}
            onPress={() => handleCreateWallet()}
            disabled={
              isPending ||
              Object.keys(passwordErrors).length > 0 ||
              Object.keys(nameErrors).length > 0
            }
            testID="walletFormContinueButton"
          />
        </Actions>
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

const Actions = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}

const useBold = () => {
  return {
    b: (text: React.ReactNode) => (
      <Text style={a.body_1_lg_medium}>{text}</Text>
    ),
  }
}
