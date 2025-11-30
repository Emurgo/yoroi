import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'

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

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {YoroiHelpLink} from '~/features/SetupWallet/common/constants'
import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateWalletMnemonic} from '~/features/WalletManager/hooks/useCreateWalletMnemonic'
import {useBold} from '~/hooks/useBold'
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
import {isEmptyString} from '~/wallets/utils/string'
import {
  getWalletNameError,
  validatePassword,
  validateWalletName,
} from '~/wallets/utils/validators'

const useSizeModal = () => {
  const heightScreen = useWindowDimensions().height
  const mediumScreenHeight = 800
  const largerScreenHeight = 900
  const percNamePassword =
    heightScreen >= largerScreenHeight
      ? 58
      : heightScreen >= mediumScreenHeight
        ? 65
        : 85
  const percChecksum =
    heightScreen >= largerScreenHeight
      ? 48
      : heightScreen >= mediumScreenHeight
        ? 55
        : 75

  const modalHeightChecksum = (heightScreen / 100) * percChecksum
  const modalHeightNamePassword = (heightScreen / 100) * percNamePassword

  return {modalHeightNamePassword, modalHeightChecksum} as const
}

// when restoring, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const WalletDetailsScreen = () => {
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})
  const {modalHeightNamePassword, modalHeightChecksum} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(
    ({name}) => name,
  )
  const {trackEvent} = useAnalyticsTracking()
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

      trackEvent(AnalyticsEventEnum.CreateWalletDetailsSubmitted)

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
    walletImplementation,
  ])

  const showModalTipsPassword = React.useCallback(() => {
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

          <CardAboutPhrase
            title={strings.setupWallet.walletPasswordModalCardTitle}
            linesOfText={[
              strings.setupWallet.walletPasswordModalCardFirstItem,
              strings.setupWallet.walletPasswordModalCardSecondItem,
            ]}
          />
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiHelpLink)
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
        </Modal.Footer>
      ),
      height: modalHeightNamePassword,
    })
  }, [
    strings,
    openModal,
    closeModal,
    showRestoreWalletInfoModalChanged,
    modalHeightNamePassword,
  ])

  React.useEffect(() => {
    if (showRestoreWalletInfoModal) showModalTipsPassword()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRestoreWalletInfoModal])

  const showModalTipsPlateNumber = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <Modal.Content>
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
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiHelpLink)
            }}
          />

          <Button
            title={strings.setupWallet.continueButton}
            onPress={closeModal}
          />
        </Modal.Footer>
      ),
      height: modalHeightChecksum,
    })
  }

  return (
    <SafeArea style={[a.gap_lg]}>
      <StepperProgress
        style={[a.px_lg]}
        currentStep={4}
        currentStepTitle={strings.setupWallet.stepWalletDetails}
        totalSteps={4}
      />

      <View style={[a.px_lg, a.flex_row, a.align_center]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.setupWallet.walletDetailsTitle(bold)}
        </Text>

        <Info onPress={showModalTipsPassword} />
      </View>

      <ScrollView contentContainerStyle={[a.pt_lg, a.gap_lg, a.px_lg]}>
        <TextInput
          enablesReturnKeyAutomatically
          autoFocus={!showRestoreWalletInfoModal}
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
          style={[a.flex_row, a.align_center, a.justify_center, a.align_center]}
        >
          <Icon.WalletAvatar
            image={Blockies({seed}).asBase64()}
            style={{width: 24, height: 24}}
            size={24}
          />

          <Space.Width.sm />

          <Text
            style={[
              ta.text_gray_medium,
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

      <SafeArea.Footer>
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
