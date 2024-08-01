import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native'

import {Button, Spacer, useModal} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../kernel/navigation'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {networkConfigs} from '../../WalletManager/network-manager/network-manager'
import {useStrings} from './strings'

export const NetworkTag = ({
  children,
  disabled = false,
  directChangeActive,
  style,
}: {
  children: React.ReactNode
  disabled?: boolean
  directChangeActive?: boolean
  style?: ViewStyle
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

  const Tag =
    selectedNetwork === Chain.Network.Sancho ? SanchoTag : selectedNetwork === Chain.Network.Preprod ? PreprodTag : null

  const onPress = () => {
    if (directChangeActive) {
      const networks: Array<Chain.SupportedNetworks> = [
        Chain.Network.Mainnet,
        Chain.Network.Preprod,
        Chain.Network.Sancho,
      ]

      const nextNetwork = networks[(networks.indexOf(selectedNetwork) + 1) % networks.length]

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

    navigateToChangeNetwork()
  }

  return (
    <TouchableOpacity
      style={[styles.headerTitleContainerStyle, style]}
      activeOpacity={0.5}
      onPress={onPress}
      disabled={disabled && !directChangeActive}
    >
      <Text style={styles.headerTitleStyle}>{children}</Text>

      {Tag && (
        <>
          <Space width="sm" />

          <Tag />
        </>
      )}
    </TouchableOpacity>
  )
}

const PreprodTag = () => {
  const {styles} = useStyles()
  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <View style={styles.preprodTag}>
      <Text>{name}</Text>
    </View>
  )
}

const SanchoTag = () => {
  const {styles} = useStyles()
  const {name} = networkConfigs[Chain.Network.Sancho]

  return (
    <View style={styles.sanchonetLabel}>
      <Text>{name}</Text>
    </View>
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
        <Button shelleyTheme outlineOnLight title="Cancel" block onPress={onCancel} />

        <Space width="lg" />

        <Button shelleyTheme title="Switch" block onPress={onOk} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    headerTitleStyle: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_normal,
    },
    headerTitleContainerStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    preprodTag: {
      borderRadius: 1200,
      backgroundColor: color.sys_yellow_c500,
      ...atoms.px_sm,
      ...atoms.py_xs,
    },
    sanchonetLabel: {
      borderRadius: 1200,
      backgroundColor: '#66F2D6',
      ...atoms.px_sm,
      ...atoms.py_xs,
    },
    warningModal: {
      ...atoms.px_lg,
      ...atoms.flex_1,
    },
    warningModalText: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_normal,
    },
    warningModalActions: {
      ...atoms.pb_lg,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
  })

  return {styles}
}