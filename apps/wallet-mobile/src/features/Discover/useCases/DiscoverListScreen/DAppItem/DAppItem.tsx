import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import uuid from 'uuid'

import {Icon, Spacer, useModal} from '../../../../../components'
import {useBrowser} from '../../../common/BrowserProvider'
import {GOOGLE_DAPP_ID, IDAppItem} from '../../../common/DAppMock'
import {LabelCategoryDApp} from '../../../common/LabelCategoryDApp'
import {LabelConnected} from '../../../common/LabelConnected'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'

const DIALOG_DAPP_ACTIONS_HEIGHT = 294

type Props = {
  dApp: IDAppItem
  connected: boolean
  onPress?: () => void
}
export const DAppItem = ({dApp, connected, onPress}: Props) => {
  const {styles, colors} = useStyles()
  const {addBrowserTab, setTabActive, tabs} = useBrowser()
  const navigateTo = useNavigateTo()
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()
  const strings = useStrings()

  const dialogHeight = DIALOG_DAPP_ACTIONS_HEIGHT + insets.bottom

  const [isPressed, setIsPressed] = React.useState(false)

  const handlePressing = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  const handleOpenDApp = () => {
    const id = uuid.v4()
    closeModal()
    addBrowserTab(dApp.uri, id)
    setTabActive(tabs.length)

    navigateTo.browserView()
  }
  const handleDisconnectDApp = () => {
    closeModal()
  }

  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }

    if (!connected || dApp.id === GOOGLE_DAPP_ID) {
      return handleOpenDApp()
    }

    openModal(
      strings.dAppActions,
      <View>
        <View style={styles.dAppInfo}>
          <Image source={dApp.logo} style={styles.dAppLogoDialog} />

          <Text style={styles.dAppName}>{dApp.name}</Text>
        </View>

        <Spacer height={16} />

        <View>
          <DAppAction onPress={handleOpenDApp} icon={<Icon.DApp color={colors.icon} />} title={strings.openDApp} />

          <DAppAction
            onPress={handleDisconnectDApp}
            icon={<Icon.Disconnect color={colors.icon} />}
            title={strings.disconnectWalletFromDApp}
          />
        </View>
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
        <View>
          <Image source={{uri: Image.resolveAssetSource(dApp.logo).uri}} style={styles.dAppLogo} />
        </View>

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

            {dApp.category !== undefined && <LabelCategoryDApp category={dApp.category} />}
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
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const styles = StyleSheet.create({
    dAppItemContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    nameText: {
      color: color.gray[900],
      fontWeight: '500',
      ...typography['body-1-l-medium'],
    },
    descriptionText: {
      color: color.gray[600],
      ...typography['body-3-s-regular'],
    },
    descriptionTextActive: {
      color: color.gray['max'],
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
      ...typography['body-1-l-medium'],
      color: color.gray['900'],
    },
    dAppInfo: {
      alignItems: 'center',
      gap: 8,
    },
    touchDAppAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      ...padding['y-m'],
    },
    actionTitle: {
      ...typography['body-1-l-medium'],
      color: color.gray['900'],
    },
  })

  const colors = {
    icon: color.primary['900'],
  }

  return {styles, colors} as const
}