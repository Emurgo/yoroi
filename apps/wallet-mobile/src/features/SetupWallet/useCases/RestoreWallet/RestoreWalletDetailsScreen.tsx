import {useFocusEffect} from '@react-navigation/native'
import {NetworkError, useAsyncStorage} from '@yoroi/common'
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

import {Button, Icon, KeyboardAvoidingView, TextInput, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {AddressMode} from '../../../../wallet-manager/types'
import {parseWalletMeta} from '../../../../wallet-manager/validators'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import {InvalidState} from '../../../../yoroi-wallets/cardano/errors'
import {useCreateWallet, useOpenWallet, usePlate, useWalletNames} from '../../../../yoroi-wallets/hooks'
import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {
  getWalletNameError,
  REQUIRED_PASSWORD_LENGTH,
  validatePassword,
  validateWalletName,
} from '../../../../yoroi-wallets/utils'
import {debugWalletInfo, features} from '../../..'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../../WalletManager/Context'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
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
const addressMode: AddressMode = 'single'
export const RestoreWalletDetailsScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {navigateToTxHistory} = useWalletNavigation()
  const walletManager = useWalletManager()
  const {track} = useMetrics()
  const {walletNames} = useWalletNames(walletManager)
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const storage = useAsyncStorage()
  const {mnemonic, networkId, publicKeyHex, walletImplementationId} = useSetupWallet()
  const plate = usePlate({networkId, publicKeyHex})

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

  const {
    openWallet,
    isLoading: isOpenWalletLoading,
    isSuccess: isOpenWalletSuccess,
  } = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const intl = useIntl()
  const {
    createWallet,
    isLoading: isCreateWalletLoading,
    isSuccess: isCreateWalletSuccess,
  } = useCreateWallet({
    onSuccess: async (wallet) => {
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) throw new Error('invalid wallet meta')

      openWallet(walletMeta)
      track.restoreWalletDetailsSettled()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const nameErrors = validateWalletName(name, null, walletNames && !isCreateWalletSuccess ? walletNames : [])
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
    nameErrors,
  )

  const isLoading = isCreateWalletLoading || isOpenWalletLoading

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

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
                strings.walletChecksumModalCardSecondItem(plate.accountPlate.TextPart),
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
      <KeyboardAvoidingView style={{flex: 1}}>
        <StepperProgress
          style={styles.steps}
          currentStep={2}
          currentStepTitle={strings.stepWalletDetails}
          totalSteps={2}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{strings.walletDetailsTitle(bold)}</Text>

          <TouchableOpacity style={{flex: 1, alignSelf: 'center'}} onPress={showModalTipsPassword}>
            <InfoIllustration />
          </TouchableOpacity>
        </View>

        <Space height="xl" />

        <ScrollView style={styles.form}>
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
            showErrorOnBlur={!isOpenWalletSuccess}
          />

          <View style={styles.checksum}>
            <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

            <Space width="s" />

            <Text style={styles.plateNumber}>{plate.accountPlate.TextPart}</Text>

            <Space width="s" />

            <TouchableOpacity onPress={showModalTipsPlateNumber}>
              <InfoIllustration />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={strings.next}
            style={styles.button}
            onPress={
              isCreateWalletLoading || isOpenWalletLoading || isOpenWalletSuccess
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
            disabled={isLoading || Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
          />
        </View>
      </KeyboardAvoidingView>
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
    form: {
      ...theme.padding['x-l'],
      flex: 1,
    },
    steps: {
      ...theme.padding['x-l'],
    },
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    modal: {
      flex: 1,
    },
    info: {
      ...theme.padding['x-l'],
      flexDirection: 'row',
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
    button: {
      backgroundColor: theme.color.primary[500],
    },
    bolder: {
      ...theme.typography['body-1-l-medium'],
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
      ...theme.padding['l'],
    },
  })

  return {styles} as const
}

const NOOP = () => undefined
