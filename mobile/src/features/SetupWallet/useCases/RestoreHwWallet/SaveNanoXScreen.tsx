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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {YoroiHelpLink} from '~/features/SetupWallet/common/constants'
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
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {Icon} from '~/ui/Icon'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError} from '~/wallets/utils/validators'

// when hw, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const SaveNanoXScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const storage = useAsyncStorage()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {openModal, closeModal} = useModal()
  const bold = useBold({style: a.body_1_lg_medium})
  const {walletManager} = useWalletManager()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const [name, setName] = React.useState(
    features.prefillWalletInfo ? debugWalletInfo.WALLET_NAME : '',
  )

  const {trackEvent} = useAnalyticsTracking()

  const {walletImplementation, hwDeviceInfo, accountVisual, walletIdChanged} =
    useSetupWallet()

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

      trackEvent(AnalyticsEventEnum.ConnectWalletDetailsSubmitted, {
        hardware_wallet: 'Ledger',
      })

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
        <Modal.Content>
          <CardAboutPhrase
            title={strings.setupWallet.walletNameModalCardTitle}
            linesOfText={[
              strings.setupWallet.walletNameModalCardFirstItem,
              strings.setupWallet.walletNameModalCardSecondItem,
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
            checksumImage={seed}
            checksumLine={1}
            linesOfText={[
              strings.setupWallet.walletChecksumModalCardFirstItem,
              strings.setupWallet.walletChecksumModalCardSecondItem(plate),
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
    <SafeArea style={[a.gap_lg]}>
      <StepperProgress
        style={[a.px_lg]}
        currentStep={2}
        currentStepTitle={strings.setupWallet.stepWalletDetails}
        totalSteps={2}
      />

      <View style={[a.flex_row, a.px_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.setupWallet.hwWalletDetailsTitle(bold)}
        </Text>

        <Space.Width.xs />

        <Info onPress={showModalTipsPassword} />
      </View>

      <ScrollView contentContainerStyle={[a.px_lg, a.gap_lg]} style={a.flex_1}>
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
          testID="walletNameInput"
          autoComplete="off"
          showErrorOnBlur
        />

        <View style={[a.flex_row, a.align_center, a.justify_center, a.gap_sm]}>
          <Icon.WalletAvatar
            image={Blockies({seed}).asBase64()}
            style={[{width: 24, height: 24}]}
            size={24}
          />

          <Text
            style={[
              a.body_1_lg_regular,
              a.text_center,
              a.justify_center,
              a.align_center,
              ta.text_gray_medium,
            ]}
            testID="wallet-plate-number"
          >
            {plate}
          </Text>

          <Info onPress={showModalTipsPlateNumber} />
        </View>
      </ScrollView>
      <SafeArea.Footer>
        <View>
          <Button
            title={strings.setupWallet.next}
            onPress={handleOnSubmit}
            testID="setup-restore-step2-next-button"
            disabled={disabled}
          />
        </View>
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

const mediumScreenHeight = 800
const largerScreenHeight = 900

const useSizeModal = () => {
  const HEIGHT_SCREEN = useWindowDimensions().height
  const PERCENTAGE_NAME_PASSWORD =
    HEIGHT_SCREEN >= largerScreenHeight
      ? 48
      : HEIGHT_SCREEN >= mediumScreenHeight
        ? 50
        : 55
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
