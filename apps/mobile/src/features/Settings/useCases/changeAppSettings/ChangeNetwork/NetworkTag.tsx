import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native'

import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../kernel/navigation/navigation'
import {Button, ButtonType} from '../../../../../ui/Button/Button'
import {useModal} from '../../../../../ui/Modal/ModalContext'
import {Space, SpaceHeight} from '../../../../../ui/Space/Space'
import {availableNetworks} from '../../../../WalletManager/common/constants'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from './strings'

export const NetworkTag = ({
  children,
  directChangeActive,
  style,
  disabled,
  textStyle,
}: {
  children: React.ReactNode
  directChangeActive?: boolean
  style?: ViewStyle
  disabled?: boolean
  textStyle?: TextStyle
}) => {
  const {
    selected: {network: selectedNetwork},
    walletManager,
  } = useWalletManager()
  const {navigateToChangeNetwork} = useWalletNavigation()
  const {styles} = useStyles()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {track} = useMetrics()

  const Tag = selectedNetwork === Chain.Network.Preprod ? PreprodTag : null

  const onPress = () => {
    if (directChangeActive && selectedNetwork !== Chain.Network.Mainnet) {
      const nextNetwork =
        availableNetworks[
          (availableNetworks.indexOf(selectedNetwork) + 1) %
            availableNetworks.length
        ]

      if (nextNetwork === Chain.Network.Mainnet) {
        openModal({
          title: strings.networkTagModalTitle,
          content: (
            <MainnetWarningDialog
              onCancel={closeModal}
              onOk={() => {
                track.networkSelected({
                  to_network: nextNetwork,
                  from_network: selectedNetwork,
                })
                walletManager.setSelectedNetwork(nextNetwork)
                closeModal()
              }}
            />
          ),
          height: 280,
        })

        return
      }

      track.networkSelected({
        to_network: nextNetwork,
        from_network: selectedNetwork,
      })
      walletManager.setSelectedNetwork(nextNetwork)
      return
    }

    if (!directChangeActive) navigateToChangeNetwork()
  }

  return (
    <View style={[styles.headerTitleContainerStyle, style]}>
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        aria-level="1"
        ellipsizeMode="tail"
        style={[styles.headerTitleStyle, textStyle]}
      >
        {children}
      </Text>

      {Tag && (
        <View style={styles.tagContainer}>
          <Tag
            onPress={onPress}
            disabled={
              ((directChangeActive &&
                selectedNetwork === Chain.Network.Mainnet) ||
                disabled) ??
              false
            }
          />
        </View>
      )}
    </View>
  )
}

const PreprodTag = ({
  onPress,
  disabled,
}: {
  onPress: () => void
  disabled: boolean
}) => {
  const {styles} = useStyles()
  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={styles.preprodTag}
      disabled={disabled}
    >
      <Text>{name}</Text>
    </TouchableOpacity>
  )
}

const MainnetWarningDialog = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void
  onOk: () => void
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.warningModal}>
      <Text style={styles.warningModalText}>{strings.networkTagModalText}</Text>

      <SpaceHeight fill size={'lg'} />

      <View style={styles.warningModalActions}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          title="Cancel"
          onPress={onCancel}
        />

        <Space.Width.lg />

        <Button size="S" title="Switch" onPress={onOk} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {palette: p, atoms} = useTheme()
  const width = useWindowDimensions().width - 120

  const styles = StyleSheet.create({
    headerTitleStyle: {
      color: p.text_gray_medium,
      ...a.body_1_lg_medium,
      ...a.flex_shrink,
    },
    headerTitleContainerStyle: {
      width,
      ...a.flex_row,
      ...a.align_center,
      ...a.justify_center,
    },
    tagContainer: {
      ...a.pl_sm,
      flexShrink: 0,
    },
    preprodTag: {
      backgroundColor: p.sys_yellow_500,
      ...a.rounded_full,
      ...a.px_sm,
      ...a.py_xs,
    },
    warningModal: {
      ...a.px_lg,
      ...a.flex_1,
    },
    warningModalText: {
      ...a.body_1_lg_regular,
      color: p.text_gray_medium,
    },
    warningModalActions: {
      ...a.pb_lg,
      ...a.flex_row,
      ...a.justify_between,
    },
  })

  return {styles} as const
}
