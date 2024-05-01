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
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, TextInput, useModal} from '../../../../components'
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
import {useSetSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {useSetSelectedWalletMeta} from '../../../WalletManager/Context/SelectedWalletMetaContext'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {Info} from '../../common/Info/Info'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {PreparingWallet} from '../../common/PreparingWallet/PreparingWallet'
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
  const {resetToTxHistory} = useWalletNavigation()
  const strings = useStrings()
  const walletManager = useWalletManager()
  const {walletNames} = useWalletNames(walletManager)
  const {track} = useMetrics()
  const intl = useIntl()
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const storage = useAsyncStorage()
  const {
    mnemonic,
    networkId,
    publicKeyHex,
    walletImplementationId,
    showRestoreWalletInfoModal,
    showRestoreWalletInfoModalChanged,
  } = useSetupWallet()
  const plate = usePlate({networkId, publicKeyHex})
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
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.passwordStrengthRequirement({requiredPasswordLength: REQUIRED_PASSWORD_LENGTH})
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.repeatPasswordInputError
    : undefined

  const {
    openWallet,
    data: openWalletData,
    isLoading: isOpenWalletLoading,
    isSuccess: isOpenWalletSuccess,
  } = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      resetToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

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
      track.createWalletDetailsSettled()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
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

        <Button
          title={strings.continueButton}
          style={styles.button}
          onPress={() => {
            closeModal()
            showRestoreWalletInfoModalChanged(false)
          }}
        />

        <Space height="l" />
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

  const isLoading = isCreateWalletLoading || isOpenWalletLoading || !!openWalletData

  if (isLoading) {
    return <PreparingWallet />
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={4} currentStepTitle={strings.stepWalletDetails} totalSteps={4} />

        <View style={styles.info}>
          <Text style={styles.title}>{strings.walletDetailsTitle(bold)}</Text>

          <Info onPress={showModalTipsPassword} />
        </View>

        <Space height="xl" />

        <TextInput
          enablesReturnKeyAutomatically
          autoFocus={!showRestoreWalletInfoModal}
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
          showErrorOnBlur
        />

        <View style={styles.checksum}>
          <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

          <Space width="s" />

          <Text style={styles.plateNumber}>{plate.accountPlate.TextPart}</Text>

          <Space width="s" />

          <Info onPress={showModalTipsPlateNumber} />
        </View>
      </View>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          onPress={isLoading || isOpenWalletSuccess ? NOOP : () => handleCreateWallet()}
          disabled={isLoading || Object.keys(passwordErrors).length > 0 || Object.keys(nameErrors).length > 0}
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
    info: {
      flexDirection: 'row',
      lineHeight: 24,
    },
    modal: {
      flex: 1,
    },
    title: {
      alignSelf: 'center',
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
      alignItems: 'center',
      justifyContent: 'center',
      textAlignVertical: 'center',
    },
    walletChecksum: {
      width: 24,
      height: 24,
    },
  })

  return {styles} as const
}

const NOOP = () => undefined
