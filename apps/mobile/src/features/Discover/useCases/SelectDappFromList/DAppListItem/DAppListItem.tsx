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
import uuid from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {LabelCategoryDApp} from '~/features/Discover/common/LabelCategoryDApp'
import {LabelConnected} from '~/features/Discover/common/LabelConnected'
import {LabelSingleAddress} from '~/features/Discover/common/LabelSingleAddress'
import {useDisconnectDapp} from '~/features/Discover/common/useDisconnectDapp'
import {useNavigateTo} from '~/features/Discover/common/useNavigateTo'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'
import {
  type DAppItem,
  getDappFallbackLogo,
  isGoogleSearchItem,
} from '../../../common/helpers'

const INIT_DIALOG_DAPP_ACTIONS_HEIGHT = 286

type Props = {
  dApp: DAppItem
  connected: boolean
  onPress?: () => void
}
export const DAppListItem = ({dApp, connected, onPress}: Props) => {
  const {palette: p} = useTheme()
  const {addTab, setTabActive, tabs} = useBrowser()
  const navigateTo = useNavigateTo()
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()
  const strings = useStrings()
  const {track} = useMetrics()

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
    track.discoverConnectedBottomSheetOpenDAppClicked()

    closeModal()

    const id = uuid.v4()
    addTab(dApp.uri, id)
    setTabActive(tabs.length)

    navigateTo.browseDapp()
  }
  const handleDisconnectDApp = async (dApp: DAppItem) => {
    await disconnectDApp(dApp)
    closeModal()
  }

  const handleConfirmDisconnect = (dApp: DAppItem) => {
    closeModal()
    Alert.alert(
      strings.disconnectDApp,
      strings.confirmDisconnectDAppDescription,
      [
        {text: strings.cancel, style: 'cancel'},
        {text: strings.confirm, onPress: () => handleDisconnectDApp(dApp)},
      ],
    )
  }

  const handlePress = () => {
    track.discoverDAppItemClicked()
    if (connected) track.discoverConnectedDAppItemClicked()

    if (onPress) {
      onPress()
      return
    }

    if (!connected || isGoogleSearchItem(dApp)) {
      return handleOpenDApp()
    }

    openModal({
      title: strings.dAppActions,
      content: (
        <View style={[a.flex_col, a.px_lg]}>
          <View style={[{alignItems: 'center', gap: 8}]}>
            <Image source={{uri: logo}} style={[{width: 48, height: 48}]} />

            <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
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

          <InfoBanner iconSize={20} content={strings.disconnectWarning} />

          <Space.Height.lg />
        </View>
      ),
      footer: (
        <View style={[a.align_start, a.gap_lg, a.pb_lg]}>
          <Button
            type={ButtonType.SecondaryText}
            fontOverride={a.body_1_lg_medium}
            style={[a.gap_lg]}
            onPress={handleOpenDApp}
            icon={Icon.DApp}
            title={strings.openDApp}
            size="S"
          />

          <Button
            type={ButtonType.SecondaryText}
            fontOverride={a.body_1_lg_medium}
            style={[a.gap_lg]}
            onPress={() => handleConfirmDisconnect(dApp)}
            icon={Icon.Disconnect}
            title={strings.disconnectWalletFromDApp}
            size="S"
          />
        </View>
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
        ) : (
          <Image
            source={{uri: logo}}
            style={[{width: 40, height: 40, contentFit: 'contain'}]}
          />
        )}

        <View style={[{flex: 1}]}>
          <Text
            numberOfLines={1}
            style={[a.body_1_lg_medium, {color: p.gray_900, fontWeight: '500'}]}
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

          <View style={[{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}]}>
            {connected && <LabelConnected />}

            {dApp.isSingleAddress && <LabelSingleAddress />}

            {!isGoogleSearchItem(dApp) && (
              <LabelCategoryDApp category={dApp.category} />
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const walletsCompatibilityLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/10413017088527-DApps-and-HD-wallets-compatability'

const SingleAddressDAppWarning = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(walletsCompatibilityLink)
  }

  return (
    <WarningBanner
      content={
        <>
          <Text
            style={[a.body_2_md_regular, {color: p.text_gray_max}]}
          >{`${strings.singleAddressWarning} `}</Text>

          <Text
            style={[a.body_2_md_regular, {color: p.sys_cyan_500}]}
            onPress={handleOnPress}
          >
            {strings.learnMore}
          </Text>
        </>
      }
      iconSize={20}
    />
  )
}
