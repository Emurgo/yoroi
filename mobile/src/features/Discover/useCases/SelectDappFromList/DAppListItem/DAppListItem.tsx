import {atoms as a, useTheme} from '@yoroi/theme'

import {Image} from 'expo-image'
import * as React from 'react'
import {
  Alert,
  Linking,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {v4} from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {LabelCategoryDApp} from '~/features/Discover/common/LabelCategoryDApp'
import {LabelConnected} from '~/features/Discover/common/LabelConnected'
import {LabelSingleAddress} from '~/features/Discover/common/LabelSingleAddress'
import {useDisconnectDapp} from '~/features/Discover/common/useDisconnectDapp'
import {useNavigateTo} from '~/features/Discover/common/useNavigateTo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'

import {
  type DAppItem,
  getDappFallbackLogo,
  isDirectUrlItem,
  isGoogleSearchItem,
} from '../../../common/helpers'

const INIT_DIALOG_DAPP_ACTIONS_HEIGHT = 286

type Props = {
  dApp: DAppItem
  connected: boolean
  onPress?: () => void
}
const DAppListItemComponent = ({dApp, connected, onPress}: Props) => {
  const {palette: p, atoms: ta} = useTheme()
  const {addTabAndSetActive} = useBrowser()
  const navigateTo = useNavigateTo()
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()
  const strings = useStrings()
  const heightDialogByHeightScreen = dApp.isSingleAddress ? 612 : 492

  const heightDialogByInit = INIT_DIALOG_DAPP_ACTIONS_HEIGHT + insets.bottom
  const dialogHeight =
    heightDialogByInit < heightDialogByHeightScreen
      ? heightDialogByHeightScreen
      : heightDialogByInit

  const [isPressed, setIsPressed] = React.useState(false)

  const disconnectDApp = useDisconnectDapp()

  const logo =
    dApp.logo.length === 0 ? getDappFallbackLogo(dApp.uri) : dApp.logo

  const handlePressing = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  const handleOpenDApp = () => {
    closeModal()

    const id = v4()
    addTabAndSetActive(dApp.uri, id)

    navigateTo.browseDapp()
  }
  const handleDisconnectDApp = async (dAppItem: DAppItem) => {
    await disconnectDApp(dAppItem)
    closeModal()
  }

  const handleConfirmDisconnect = (dAppItem: DAppItem) => {
    closeModal()
    Alert.alert(
      strings.discover.disconnectDApp,
      strings.discover.confirmDisconnectDAppDescription,
      [
        {text: strings.discover.cancel, style: 'cancel'},
        {
          text: strings.discover.confirm,
          onPress: () => handleDisconnectDApp(dAppItem),
        },
      ],
    )
  }

  const handlePress = () => {
    if (onPress) return onPress()

    if (!connected || isGoogleSearchItem(dApp) || isDirectUrlItem(dApp)) {
      return handleOpenDApp()
    }

    openModal({
      title: strings.discover.dAppActions,
      content: (
        <Modal.Content style={a.flex_col}>
          <View style={[a.align_center, a.gap_sm]}>
            <Image source={{uri: logo}} style={[{width: 48, height: 48}]} />

            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              {dApp.name}
            </Text>
          </View>

          <Space.Height.md />

          {dApp.isSingleAddress && (
            <>
              <Space.Height.lg />

              <SingleAddressDAppWarning />
            </>
          )}

          <Space.Height.lg />

          <InfoBanner
            iconSize={20}
            content={strings.discover.disconnectWarning}
          />

          <Space.Height.lg />
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer style={[a.flex_row, a.gap_lg]}>
          <Button
            type={ButtonType.SecondaryText}
            fontOverride={a.body_1_lg_medium}
            onPress={handleOpenDApp}
            icon={Icon.DApp}
            title={strings.discover.openDApp}
            size="S"
          />

          <Button
            type={ButtonType.SecondaryText}
            fontOverride={a.body_1_lg_medium}
            onPress={() => handleConfirmDisconnect(dApp)}
            icon={Icon.Disconnect}
            title={strings.discover.disconnectWalletFromDApp}
            size="S"
          />
        </Modal.Footer>
      ),
      height: dialogHeight,
    })
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={() => handlePressing(true)}
      onPressOut={() => handlePressing(false)}
      onPress={handlePress}
    >
      <View style={[{flexDirection: 'row', gap: 12}]}>
        {isGoogleSearchItem(dApp) ? (
          <Icon.Google />
        ) : isDirectUrlItem(dApp) ? (
          <Icon.Globe />
        ) : (
          <Image
            source={{uri: logo}}
            style={[{width: 40, height: 40}]}
            contentFit="contain"
          />
        )}

        <View style={[{flex: 1}]}>
          <Text
            numberOfLines={1}
            style={[a.body_1_lg_medium, ta.text_gray_max]}
          >
            {dApp.name}
          </Text>

          {dApp?.description !== undefined && (
            <Text
              style={[
                a.body_3_sm_regular,
                {color: p.gray_600},
                isPressed && {color: p.gray_max},
              ]}
            >
              {dApp.description}
            </Text>
          )}

          <Space.Height.sm />

          <View style={[a.flex_row, a.gap_sm, a.flex_wrap]}>
            {connected && <LabelConnected />}

            {dApp.isSingleAddress && <LabelSingleAddress />}

            {!isGoogleSearchItem(dApp) && !isDirectUrlItem(dApp) && (
              <LabelCategoryDApp category={dApp.category} />
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export const DAppListItem = React.memo(
  DAppListItemComponent,
  (prevProps, nextProps) => {
    // Only re-render if dApp ID, connected status, or onPress callback changes
    return (
      prevProps.dApp.id === nextProps.dApp.id &&
      prevProps.connected === nextProps.connected &&
      prevProps.onPress === nextProps.onPress
    )
  },
)

const walletsCompatibilityLink = 'https://help.yoroi-wallet.com/en/'

const SingleAddressDAppWarning = () => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(walletsCompatibilityLink)
  }

  return (
    <WarningBanner
      content={
        <>
          <Text
            style={[a.body_2_md_regular, ta.text_gray_max]}
          >{`${strings.discover.singleAddressWarning} `}</Text>

          <Text
            style={[a.body_2_md_regular, {color: p.sys_cyan_500}]}
            onPress={handleOnPress}
          >
            {strings.manageCollateral.learnMore}
          </Text>
        </>
      }
      iconSize={20}
    />
  )
}
