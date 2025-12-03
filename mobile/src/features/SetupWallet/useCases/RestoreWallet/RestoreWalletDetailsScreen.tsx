import {isEmptyString} from '@yoroi/cardano-wallet'
import {getWalletNameError, validatePassword} from '@yoroi/cardano-wallet'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'
import {parseWalletMeta} from '@yoroi/wallet-manager/common/validators/wallet-meta'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useCreateWalletMnemonic} from '@yoroi/wallet-manager/hooks/useCreateWalletMnemonic'

import {walletChecksum} from '@emurgo/cip4-js'
import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  Linking,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {useBold} from '~/common/hooks/useBold'
import {YoroiHelpLink} from '~/features/SetupWallet/common/constants'
import {requiredPasswordLength} from '~/kernel/constants'
import {showErrorDialog} from '~/kernel/dialogs'
import {debugWalletInfo, features} from '~/kernel/features'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {Icon} from '~/ui/Icon'
import {Info as InfoIcon} from '~/ui/InfoIcon/InfoIcon'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {TextInput} from '~/ui/TextInput/TextInput'

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
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
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

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError)
          : showErrorDialog(errorMessages.generalError, undefined, {
              message: error.message,
            })
      })
    },
  })

  const passwordErrorText =
    passwordErrors.passwordIsWeak && !isPending
      ? strings.setupWallet.passwordStrengthRequirement(requiredPasswordLength)
      : undefined
  const passwordConfirmationErrorText =
    passwordErrors.matchesConfirmation && !isPending
      ? strings.setupWallet.repeatPasswordInputError
      : undefined

  const nameErrors = !isCreateWalletSuccess
    ? walletManager.validateWalletName(name)
    : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
      mustBeFilled: strings.setupWallet.mustBeFilled,
    },
    nameErrors,
  )

  const disabled =
    isPending ||
    Object.keys(nameErrors ?? {}).length > 0 ||
    Object.keys(passwordErrors).length > 0

  const showModalTipsPassword = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <Modal.Content>
          <CardAboutPhrase
            title={strings.setupWallet.walletNameModalCardTitle}
            linesOfText={[
              strings.setupWallet.walletNameModalCardFirstItem,
              strings.setupWallet.walletNameModalCardSecondItem,
            ]}
          />

          <Space.Height.lg />

          <CardAboutPhrase
            title={strings.setupWallet.walletPasswordModalCardTitle}
            linesOfText={[
              strings.setupWallet.walletPasswordModalCardFirstItem,
              strings.setupWallet.walletPasswordModalCardSecondItem,
            ]}
          />

          <Space.Height.lg />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiHelpLink)
            }}
          />
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <Button
            title={strings.setupWallet.continueButton}
            onPress={closeModal}
          />
        </Modal.Footer>
      ),
      height: HEIGHT_MODAL_NAME_PASSWORD,
    })
  }

  const showModalTipsPlateNumber = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <Modal.Content>
          <CardAboutPhrase
            title={strings.setupWallet.walletChecksumModalCardTitle}
            checksumImage={plate.ImagePart}
            checksumLine={1}
            linesOfText={[
              strings.setupWallet.walletChecksumModalCardFirstItem,
              strings.setupWallet.walletChecksumModalCardSecondItem(
                plate.TextPart,
              ),
              strings.setupWallet.walletChecksumModalCardThirdItem,
            ]}
          />

          <Space.Height.lg />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiHelpLink)
            }}
          />
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <Button
            title={strings.setupWallet.continueButton}
            onPress={closeModal}
          />
        </Modal.Footer>
      ),
      height: HEIGHT_MODAL_CHECKSUM,
    })
  }

  return (
    <SafeArea>
      <StepperProgress
        style={[a.px_lg]}
        currentStep={2}
        currentStepTitle={strings.setupWallet.stepWalletDetails}
        totalSteps={2}
      />

      <View style={[a.flex_row, a.p_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.setupWallet.walletDetailsTitle(bold)}
        </Text>

        <Info onPress={showModalTipsPassword} />
      </View>

      <ScrollView style={a.flex_1} contentContainerStyle={[a.px_lg, a.gap_lg]}>
        <TextInput
          enablesReturnKeyAutomatically
          autoFocus
          label={strings.setupWallet.walletDetailsNameInput}
          value={name}
          onChangeText={(walletName: string) => setName(walletName)}
          errorText={
            !isEmptyString(walletNameErrorText) &&
            walletNameErrorText &&
            !isPending
              ? walletNameErrorText
              : undefined
          }
          errorDelay={0}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="walletNameInput"
          autoComplete="off"
          textContentType="none"
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
          textContentType="none"
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
          textContentType="none"
        />

        <View style={[a.flex_row, a.align_center, a.justify_center, a.gap_sm]}>
          <Icon.WalletAvatar
            image={Blockies({seed: plate.ImagePart}).asBase64()}
            style={{
              width: 24,
              height: 24,
            }}
            size={24}
          />

          <Text
            style={[
              ta.text_gray_medium,
              a.body_1_lg_regular,
              a.text_center,
              a.justify_center,
              a.align_center,
            ]}
            testID="wallet-plate-number"
          >
            {plate.TextPart}
          </Text>

          <Info onPress={showModalTipsPlateNumber} />
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={strings.setupWallet.next}
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
      </SafeArea.Footer>
    </SafeArea>
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
