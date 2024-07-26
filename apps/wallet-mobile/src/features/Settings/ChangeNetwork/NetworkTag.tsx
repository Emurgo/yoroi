import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {isDev} from '../../../kernel/env'
import {useWalletNavigation} from '../../../kernel/navigation'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {networkConfigs} from '../../WalletManager/network-manager/network-manager'

export const NetworkTag = ({
  children,
  disabled = false,
  directChangeOnDevActive,
}: {
  children: React.ReactNode
  disabled?: boolean
  directChangeOnDevActive?: boolean
}) => {
  const {
    selected: {network},
    walletManager,
  } = useWalletManager()
  const {navigateToChangeNetwork} = useWalletNavigation()
  const {styles} = useStyles()

  const Tag = network === Chain.Network.Sancho ? SanchoTag : network === Chain.Network.Preprod ? PreprodTag : null

  const onPress = () => {
    if (directChangeOnDevActive && isDev) {
      const networks: Array<Chain.SupportedNetworks> = [
        Chain.Network.Mainnet,
        Chain.Network.Preprod,
        Chain.Network.Sancho,
      ]
      walletManager.setSelectedNetwork(networks[(networks.indexOf(network) + 1) % networks.length])
      return
    }

    navigateToChangeNetwork()
  }

  return (
    <TouchableOpacity
      style={styles.headerTitleContainerStyle}
      activeOpacity={0.5}
      onPress={onPress}
      disabled={disabled && !directChangeOnDevActive}
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
  })

  return {styles}
}
