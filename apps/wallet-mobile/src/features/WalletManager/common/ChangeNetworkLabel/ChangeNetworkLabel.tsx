import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {NetworkLabel} from '../constants'

export const ChangeNetworkLabel = ({children, disabled = false}: {children: React.ReactNode; disabled?: boolean}) => {
  const {
    walletManager,
    selected: {network},
  } = useWalletManager()

  const {styles} = useStyles()

  const LabelCompoent = Labels[network]
  return (
    <TouchableOpacity
      style={styles.headerTitleContainerStyle}
      activeOpacity={0.5}
      onPress={() => {
        const networks: Array<Chain.SupportedNetworks> = [
          Chain.Network.Mainnet,
          Chain.Network.Preprod,
          Chain.Network.Sancho,
        ]

        walletManager.setSelectedNetwork(networks[(networks.indexOf(network) + 1) % networks.length])
      }}
      disabled={disabled}
    >
      <Text style={styles.headerTitleStyle}>{children}</Text>

      <Space width="sm" />

      {LabelCompoent && <LabelCompoent />}
    </TouchableOpacity>
  )
}

const PreprodLabel = () => {
  const {styles} = useStyles()
  const label = NetworkLabel[Chain.Network.Preprod]

  return (
    <View style={styles.preprodLabel}>
      <Text>{label}</Text>
    </View>
  )
}

const SanchoLabel = () => {
  const {styles} = useStyles()
  const label = NetworkLabel[Chain.Network.Sancho]

  return (
    <View style={styles.sanchonetLabel}>
      <Text>{label}</Text>
    </View>
  )
}

const Labels = {
  [Chain.Network.Mainnet]: null,
  [Chain.Network.Preprod]: PreprodLabel,
  [Chain.Network.Sancho]: SanchoLabel,
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
    preprodLabel: {
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
