import {useFocusEffect} from '@react-navigation/native'
import {useAsyncStorage} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {Api} from '@yoroi/types'
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

import {Button, Icon, KeyboardAvoidingView, TextInput, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
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
import {parseWalletMeta} from '../../../WalletManager/common/validators'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerContext'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {PreparingWallet} from '../../common/PreparingWallet/PreparingWallet'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
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
const addressMode: AddressMode = 'single'
export const RestoreWalletDetailsScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const walletManager = useWalletManager()
  const {track} = useMetrics()
  const {walletNames} = useWalletNames(walletManager)
  const [name, setName] = React.useState(features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '')
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

  const intl = useIntl()
  const {
    createWallet,
    isLoading,
    isSuccess: isCreateWalletSuccess,
  } = useCreateWallet({
    onSuccess: async (wallet) => {
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) throw new Error('invalid wallet meta')

      track.restoreWalletDetailsSettled()
      // TODO: revist should open the wallet and navigate to it
      resetToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  useFocusEffect(
    React.useCallback(() => {
      track.restoreWalletDetailsStepViewed()
    }, [track]),
  )

  if (isLoading) return <PreparingWallet />

  const nameErrors = validateWalletName(name, null, walletNames && !isCreateWalletSuccess ? walletNames : [])
  const walletNameErrorText = getWalletNameError(
    {tooLong: strings.tooLong, nameAlreadyTaken: strings.nameAlreadyTaken, mustBeFilled: strings.mustBeFilled},
    nameErrors,
  )

  const showModalTipsPassword = () => {
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
      <KeyboardAvoidingView style={{flex: 1}}>
        <StepperProgress
          style={styles.steps}
          currentStep={2}
          currentStepTitle={strings.stepWalletDetails}
          totalSteps={2}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{strings.walletDetailsTitle(bold)}</Text>

          <Info onPress={showModalTipsPassword} />
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
            disabled={isLoading}
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
            disabled={isLoading}
            textContentType="oneTimeCode"
          />

          <Space height="xl" />

          <View style={styles.checksum}>
            <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

            <Space width="sm" />

            <Text style={styles.plateNumber}>{plate.accountPlate.TextPart}</Text>

            <Space width="sm" />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={strings.next}
            style={styles.button}
            onPress={() =>
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

const Info = ({onPress}: {onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <InfoIcon size={24} />
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
    form: {
      ...atoms.px_lg,
      flex: 1,
    },
    steps: {
      ...atoms.px_lg,
    },
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: color.gray_cmin,
    },
    modal: {
      flex: 1,
    },
    info: {
      ...atoms.px_lg,
      flexDirection: 'row',
    },
    title: {
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
    button: {
      backgroundColor: color.primary_c500,
    },
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
  })

  return {styles} as const
}
