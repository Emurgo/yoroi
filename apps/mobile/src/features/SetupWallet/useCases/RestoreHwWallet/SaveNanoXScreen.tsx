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
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {YoroiZendeskLink} from '~/features/SetupWallet/common/constants'
import {Info as InfoIcon} from '~/features/SetupWallet/illustrations/Info'
import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateWalletXPub} from '~/features/WalletManager/hooks/useCreateWalletXPub'
import {useBold} from '~/hooks/useBold'
import {showErrorDialog} from '~/kernel/dialogs'
import {debugWalletInfo, features} from '~/kernel/features'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {Icon} from '~/ui/Icon'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError} from '~/wallets/utils/validators'

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

// when hw, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const SaveNanoXScreen = () => {
  const strings = useStrings()
  const {palette: p, isDark} = useTheme()
  const storage = useAsyncStorage()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {track} = useMetrics()
  const {openModal, closeModal} = useModal()
  const bold = useBold({style: a.body_1_lg_medium})
  const {walletManager} = useWalletManager()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const [name, setName] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '',
  )

  const {walletImplementation, hwDeviceInfo, accountVisual, walletIdChanged} =
    useSetupWallet()

  useFocusEffect(
    React.useCallback(() => {
      track.connectWalletDetailsPageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  if (!hwDeviceInfo) throw new Error('no hwDeviceInfo')
  const {plate, seed} = walletManager.checksum(hwDeviceInfo.bip44AccountPublic)

  const {createWallet, isPending} = useCreateWalletXPub({
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

      track.restoreWalletDetailsSettled()
      track.connectWalletDetailsSubmitted()

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog({
              title: errorMessages.networkError.title,
              message: errorMessages.networkError.message,
            })
          : showErrorDialog({
              title: errorMessages.generalError.title,
              message: errorMessages.generalError.message,
            })
      })
    },
  })

  const nameErrors = !isPending ? walletManager.validateWalletName(name) : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
      mustBeFilled: strings.setupWallet.mustBeFilled,
    },
    nameErrors,
  )

  const disabled = isPending || Object.keys(nameErrors ?? {}).length > 0

  const handleOnSubmit = React.useCallback(() => {
    createWallet({
      name,
      bip44AccountPublic: hwDeviceInfo.bip44AccountPublic,
      implementation: walletImplementation,
      hwDeviceInfo,
      readOnly: false,
      addressMode,
      accountVisual,
    })
  }, [accountVisual, createWallet, hwDeviceInfo, name, walletImplementation])

  const showModalTipsPassword = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.pb_lg, a.px_lg]}>
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
              Linking.openURL(YoroiZendeskLink)
            }}
          />
        </View>
      ),
      footer: (
        <Button
          title={strings.setupWallet.continueButton}
          onPress={closeModal}
        />
      ),
      height: HEIGHT_MODAL_NAME_PASSWORD,
    })
  }

  const showModalTipsPlateNumber = () => {
    openModal({
      title: strings.setupWallet.walletDetailsModalTitle,
      content: (
        <View style={[a.flex_1, a.pb_lg, a.px_lg]}>
          <CardAboutPhrase
            title={strings.setupWallet.walletChecksumModalCardTitle}
            checksumImage={seed}
            checksumLine={1}
            linesOfText={[
              strings.setupWallet.walletChecksumModalCardFirstItem,
              strings.setupWallet.walletChecksumModalCardSecondItem,
              strings.setupWallet.walletChecksumModalCardThirdItem,
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
      footer: (
        <Button
          title={strings.setupWallet.continueButton}
          onPress={closeModal}
        />
      ),
      height: HEIGHT_MODAL_CHECKSUM,
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
          currentStepTitle={strings.setupWallet.stepWalletDetails}
          totalSteps={2}
        />

        <Space.Height.xl />

        <View style={[a.flex_row]}>
          <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
            {strings.setupWallet.hwWalletDetailsTitle(bold)}
          </Text>

          <Space.Width.xs />

          <Info onPress={showModalTipsPassword} />
        </View>

        <Space.Height.xl />

        <ScrollView style={[a.flex_1]}>
          <TextInput
            enablesReturnKeyAutomatically
            autoFocus
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
            testID="walletNameInput"
            autoComplete="off"
            showErrorOnBlur
          />

          <Space.Height.lg />

          <View style={[a.flex_row, a.align_center, a.justify_center]}>
            <Icon.WalletAvatar
              image={new Blockies({seed}).asBase64()}
              style={[{width: 24, height: 24}]}
              size={24}
            />

            <Space.Width.sm />

            <Text
              style={[
                a.body_1_lg_regular,
                a.text_center,
                a.justify_center,
                a.align_center,
                {color: p.text_gray_medium},
              ]}
              testID="wallet-plate-number"
            >
              {plate}
            </Text>

            <Space.Width.sm />

            <Info onPress={showModalTipsPlateNumber} />
          </View>
        </ScrollView>

        <View>
          <Button
            title={strings.setupWallet.next}
            onPress={handleOnSubmit}
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
