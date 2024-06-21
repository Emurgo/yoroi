import {useDappConnector} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import uuid from 'uuid'

import {Icon, Spacer, useModal} from '../../../../../components'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useBrowser} from '../../../common/BrowserProvider'
import {type DAppItem, getDappFallbackLogo, isGoogleSearchItem} from '../../../common/helpers'
import {LabelCategoryDApp} from '../../../common/LabelCategoryDApp'
import {LabelConnected} from '../../../common/LabelConnected'
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

  const HEIGHT_SCREEN = useWindowDimensions().height
  const heightDialogByHeightScreen = (HEIGHT_SCREEN * 40) / 100
  const heightDialogByInit = INIT_DIALOG_DAPP_ACTIONS_HEIGHT + insets.bottom
  const dialogHeight = heightDialogByInit < heightDialogByHeightScreen ? heightDialogByHeightScreen : heightDialogByInit

  const [isPressed, setIsPressed] = React.useState(false)

  const logo = dApp.logo.length === 0 ? getDappFallbackLogo(dApp.uri) : dApp.logo

  const handlePressing = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  const handleOpenDApp = () => {
    track.discoverConnectedBottomSheetOpenDAppClicked()

    const id = uuid.v4()
    closeModal()
    addTab(dApp.uri, id)
    setTabActive(tabs.length)

    navigateTo.browseDapp()
  }
  const handleDisconnectDApp = async (dApp: DAppItem) => {
    track.discoverConnectedBottomSheetDisconnectClicked()

    const promises = dApp.origins.map(async (o) => {
      await manager.removeConnection({dappOrigin: o})
    })
    await Promise.all(promises)
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
    if (onPress) {
      onPress()
      return
    }

    if (!connected || isGoogleSearchItem(dApp)) {
      return handleOpenDApp()
    }

    openModal(
      strings.dAppActions,
      <View style={styles.rootDialog}>
        <View style={styles.dAppInfo}>
          <Image source={{uri: logo}} style={styles.dAppLogoDialog} />

          <Text style={styles.dAppName}>{dApp.name}</Text>
        </View>

        <Spacer height={16} />

        <View>
          <DAppAction onPress={handleOpenDApp} icon={<Icon.DApp color={colors.icon} />} title={strings.openDApp} />

          <DAppAction
            onPress={() => handleConfirmDisconnect(dApp)}
            icon={<Icon.Disconnect color={colors.icon} />}
            title={strings.disconnectWalletFromDApp}
          />
        </View>

        <Spacer fill />
      </View>,
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

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    rootDialog: {
      ...atoms.flex_col,
    },
    dAppItemContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    nameText: {
      color: color.gray_c900,
      fontWeight: '500',
      ...atoms.body_1_lg_medium,
    },
    descriptionText: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
    },
    descriptionTextActive: {
      color: color.gray_cmax,
    },
    flexFull: {
      flex: 1,
    },
    labelBox: {
      flexDirection: 'row',
      gap: 8,
    },
    dAppLogo: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    dAppLogoDialog: {
      width: 48,
      height: 48,
    },
    dAppName: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
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
      color: color.gray_c900,
    },
  })

  const colors = {
    icon: color.primary_c900,
    dappIcon: color.gray_c600,
  }

  return {styles, colors} as const
}
