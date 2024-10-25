import {useDappConnector} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import uuid from 'uuid'

import {Icon} from '../../../../../components/Icon'
import {InfoBanner} from '../../../../../components/InfoBanner/InfoBanner'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Warning} from '../../../../../components/Warning/Warning'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useBrowser} from '../../../common/BrowserProvider'
import {type DAppItem, getDappFallbackLogo, isGoogleSearchItem} from '../../../common/helpers'
import {LabelCategoryDApp} from '../../../common/LabelCategoryDApp'
import {LabelConnected} from '../../../common/LabelConnected'
import {LabelSingleAddress} from '../../../common/LabelSingleAddress'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'

const INIT_DIALOG_DAPP_ACTIONS_HEIGHT = 286

type Props = {
  dApp: DAppItem
  connected: boolean
  onPress?: () => void
}
export const DAppListItem = ({dApp, connected, onPress}: Props) => {
  const {styles, colors} = useStyles()
  const {addTab, setTabActive, tabs} = useBrowser()
  const navigateTo = useNavigateTo()
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()
  const strings = useStrings()
  const {manager} = useDappConnector()
  const {track} = useMetrics()

  const heightDialogByHeightScreen = dApp.isSingleAddress ? 612 : 492

  const heightDialogByInit = INIT_DIALOG_DAPP_ACTIONS_HEIGHT + insets.bottom
  const dialogHeight = heightDialogByInit < heightDialogByHeightScreen ? heightDialogByHeightScreen : heightDialogByInit

  const [isPressed, setIsPressed] = React.useState(false)

  const logo = dApp.logo.length === 0 ? getDappFallbackLogo(dApp.uri) : dApp.logo

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
    track.discoverConnectedBottomSheetDisconnectClicked()

    const connections = dApp.origins.map((origin) => ({dappOrigin: origin}))
    await manager.removeConnections(connections)
    closeModal()
  }

  const handleConfirmDisconnect = (dApp: DAppItem) => {
    closeModal()
    Alert.alert(strings.disconnectDApp, strings.confirmDisconnectDAppDescription, [
      {text: strings.cancel, style: 'cancel'},
      {text: strings.confirm, onPress: () => handleDisconnectDApp(dApp)},
    ])
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

    openModal(
      strings.dAppActions,
      <ScrollView style={styles.rootDialog} bounces={false}>
        <View style={styles.dAppInfo}>
          <Image source={{uri: logo}} style={styles.dAppLogoDialog} />

          <Text style={styles.dAppName}>{dApp.name}</Text>
        </View>

        <Spacer height={16} />

        {dApp.isSingleAddress && (
          <>
            <Space height="lg" />

            <SingleAddressDAppWarning />
          </>
        )}

        <Space height="lg" />

        <InfoBanner iconSize={20} content={strings.disconnectWarning} />

        <Space height="lg" />

        <View>
          <DAppAction onPress={handleOpenDApp} icon={<Icon.DApp color={colors.icon} />} title={strings.openDApp} />

          <DAppAction
            onPress={() => handleConfirmDisconnect(dApp)}
            icon={<Icon.Disconnect color={colors.icon} />}
            title={strings.disconnectWalletFromDApp}
          />
        </View>

        <Spacer fill />
      </ScrollView>,
      dialogHeight,
    )
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={() => handlePressing(true)}
      onPressOut={() => handlePressing(false)}
      onPress={handlePress}
    >
      <View style={styles.dAppItemContainer}>
        {isGoogleSearchItem(dApp) ? <Icon.Google /> : <Image source={{uri: logo}} style={styles.dAppLogo} />}

        <View style={styles.flexFull}>
          <Text numberOfLines={1} style={styles.nameText}>
            {dApp.name}
          </Text>

          {dApp?.description !== undefined && (
            <Text style={[styles.descriptionText, isPressed && styles.descriptionTextActive]}>{dApp.description}</Text>
          )}

          <Spacer height={8} />

          <View style={styles.labelBox}>
            {connected && <LabelConnected />}

            {dApp.isSingleAddress && <LabelSingleAddress />}

            {!isGoogleSearchItem(dApp) && <LabelCategoryDApp category={dApp.category} />}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

type DAppActionProps = {
  icon: React.ReactNode
  title: string
  onPress: () => void
}
const DAppAction = ({icon: IconAction, title, onPress}: DAppActionProps) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.touchDAppAction} onPress={onPress}>
      {IconAction}

      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  )
}

const walletsCompatibilityLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/10413017088527-DApps-and-HD-wallets-compatability'

const SingleAddressDAppWarning = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(walletsCompatibilityLink)
  }

  return (
    <Warning
      content={
        <>
          <Text style={styles.warningText}>{`${strings.singleAddressWarning} `}</Text>

          <Text style={[styles.warningText, styles.link]} onPress={handleOnPress}>
            {strings.learnMore}
          </Text>
        </>
      }
      iconSize={20}
    />
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    rootDialog: {
      ...atoms.flex_col,
      ...atoms.px_lg,
    },
    dAppItemContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    nameText: {
      color: color.gray_900,
      fontWeight: '500',
      ...atoms.body_1_lg_medium,
    },
    descriptionText: {
      color: color.gray_600,
      ...atoms.body_3_sm_regular,
    },
    descriptionTextActive: {
      color: color.gray_max,
    },
    flexFull: {
      flex: 1,
    },
    labelBox: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    dAppLogo: {
      width: 40,
      height: 40,
      contentFit: 'contain',
    },
    dAppLogoDialog: {
      width: 48,
      height: 48,
    },
    dAppName: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    dAppInfo: {
      alignItems: 'center',
      gap: 8,
    },
    touchDAppAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      ...atoms.py_lg,
    },
    actionTitle: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_max,
    },
    warningText: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_max,
    },
    link: {
      color: color.sys_cyan_500,
    },
  })

  const colors = {
    icon: color.primary_900,
    dappIcon: color.gray_600,
  }

  return {styles, colors} as const
}
