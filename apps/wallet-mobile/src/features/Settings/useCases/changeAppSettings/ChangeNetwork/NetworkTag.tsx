import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TextStyle, TouchableOpacity, useWindowDimensions, View, ViewStyle} from 'react-native'

import {Button, ButtonType} from '../../../../../components/Button/Button'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../kernel/navigation'
import {availableNetworks} from '../../../../WalletManager/common/constants'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {networkConfigs} from '../../../../WalletManager/network-manager/network-manager'
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
      const nextNetwork = availableNetworks[(availableNetworks.indexOf(selectedNetwork) + 1) % availableNetworks.length]

      if (nextNetwork === Chain.Network.Mainnet) {
        openModal(
          strings.networkTagModalTitle,
          <MainnetWarningDialog
            onCancel={closeModal}
            onOk={() => {
              track.networkSelected({to_network: nextNetwork, from_network: selectedNetwork})
              walletManager.setSelectedNetwork(nextNetwork)
              closeModal()
            }}
          />,
          280,
        )

        return
      }

      track.networkSelected({to_network: nextNetwork, from_network: selectedNetwork})
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
            disabled={((directChangeActive && selectedNetwork === Chain.Network.Mainnet) || disabled) ?? false}
          />
        </View>
      )}
    </View>
  )
}

const PreprodTag = ({onPress, disabled}: {onPress: () => void; disabled: boolean}) => {
  const {styles} = useStyles()
  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.5} style={styles.preprodTag} disabled={disabled}>
      <Text>{name}</Text>
    </TouchableOpacity>
  )
}

const MainnetWarningDialog = ({onCancel, onOk}: {onCancel: () => void; onOk: () => void}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.warningModal}>
      <Text style={styles.warningModalText}>{strings.networkTagModalText}</Text>

      <Spacer fill />

      <View style={styles.warningModalActions}>
        <Button size="S" type={ButtonType.Secondary} title="Cancel" onPress={onCancel} />

        <Space width="lg" />

        <Button size="S" title="Switch" onPress={onOk} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const width = useWindowDimensions().width - 120

  const styles = StyleSheet.create({
    headerTitleStyle: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_medium,
      ...atoms.flex_shrink,
    },
    headerTitleContainerStyle: {
      width,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    tagContainer: {
      ...atoms.pl_sm,
      flexShrink: 0,
    },
    preprodTag: {
      backgroundColor: color.sys_yellow_500,
      ...atoms.rounded_full,
      ...atoms.px_sm,
      ...atoms.py_xs,
    },
    warningModal: {
      ...atoms.px_lg,
      ...atoms.flex_1,
    },
    warningModalText: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    warningModalActions: {
      ...atoms.pb_lg,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
  })

  return {styles} as const
}
