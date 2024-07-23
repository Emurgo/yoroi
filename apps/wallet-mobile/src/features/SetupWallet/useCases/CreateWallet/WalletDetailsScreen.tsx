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
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {Button, Icon, KeyboardAvoidingView, TextInput, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {logger} from '../../../../kernel/logger/logger'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {isEmptyString} from '../../../../kernel/utils'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../../../../yoroi-wallets/utils'
import {debugWalletInfo, features} from '../../..'
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
export const WalletDetailsScreen = () => {
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {styles} = useStyles()
  const {track} = useMetrics()
  const bold = useBold()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const walletNames = Array.from(walletManager.walletMetas.values()).map(({name}) => name)
  const intl = useIntl()
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
  const plate = walletChecksum(publicKeyHex)
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
  const passwordRef = React.useRef<RNTextInput>(null)
  const [password, setPassword] = React.useState(features.prefillWalletInfo ? debugWalletInfo.PASSWORD : '')

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
    isLoading,
    isSuccess: isCreateWalletSuccess,
  } = useCreateWalletMnemonic({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error('WalletDetailsScreen: wallet meta is invalid, reached an invalid state.')
        logger.error(error)
        throw error
      }

      track.createWalletDetailsSettled()

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

  const nameErrors = validateWalletName(name, null, !isCreateWalletSuccess ? walletNames : [])
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
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
  }, [accountVisual, createWallet, mnemonic, name, password, track, walletImplementation])

  const showModalTipsPassword = React.useCallback(() => {
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

        <Button
          title={strings.continueButton}
          style={styles.button}
          onPress={() => {
            closeModal()
            showRestoreWalletInfoModalChanged(false)
          }}
          testId="setup-modal-continue-button"
        />

        <Space height="lg" />
      </View>,
      HEIGHT_MODAL_NAME_PASSWORD,
    )
  }, [
    HEIGHT_MODAL_NAME_PASSWORD,
    closeModal,
    openModal,
    showRestoreWalletInfoModalChanged,
    strings.continueButton,
    strings.walletDetailsModalTitle,
    strings.walletNameModalCardFirstItem,
    strings.walletNameModalCardSecondItem,
    strings.walletNameModalCardTitle,
    strings.walletPasswordModalCardFirstItem,
    strings.walletPasswordModalCardSecondItem,
    strings.walletPasswordModalCardTitle,
    styles.button,
    styles.modal,
  ])

  React.useEffect(() => {
    if (showRestoreWalletInfoModal) showModalTipsPassword()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRestoreWalletInfoModal])

  const showModalTipsPlateNumber = () => {
    openModal(
      strings.walletDetailsModalTitle,
      <View style={styles.modal}>
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

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="lg" />
      </View>,
      HEIGHT_MODAL_CHECKSUM,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={styles.container}>
        <StepperProgress
          style={styles.steps}
          currentStep={4}
          currentStepTitle={strings.stepWalletDetails}
          totalSteps={4}
        />

        <View style={styles.infoText}>
          <Text style={styles.title}>{strings.walletDetailsTitle(bold)}</Text>

          <Info onPress={showModalTipsPassword} />
        </View>

        <Space height="xl" />

        <ScrollView style={styles.scroll}>
          <TextInput
            enablesReturnKeyAutomatically
            autoFocus={!showRestoreWalletInfoModal}
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
            showErrorOnBlur
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

            <Text style={styles.plateNumber}>{plate.TextPart}</Text>

            <Space width="sm" />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <Actions>
          <Button
            title={strings.next}
            style={styles.button}
            onPress={() => handleCreateWallet()}
            disabled={isLoading || Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
            testID="walletFormContinueButton"
          />

          <Space height="sm" />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

const Actions = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[styles.actions, style]} {...props} />
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
      justifyContent: 'space-between',
      backgroundColor: color.bg_color_high,
    },
    container: {
      flex: 1,
    },
    infoText: {
      ...atoms.px_lg,
      flexDirection: 'row',
      lineHeight: 24,
    },
    modal: {
      flex: 1,
      ...atoms.px_lg,
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
      alignItems: 'center',
      justifyContent: 'center',
      textAlignVertical: 'center',
    },
    walletChecksum: {
      width: 24,
      height: 24,
    },
    actions: {
      ...atoms.p_lg,
    },
    scroll: {
      ...atoms.px_lg,
    },
    steps: {
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
