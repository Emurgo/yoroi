import {useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'

export const ExplorerInfoLinks = ({id, type}: {id: string; type: 'token' | 'pool'}) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  const handleOpenLink = async (explorer: Explorers.Explorer) => {
    if (id == null) return
    if (explorer === Explorers.Explorer.CardanoScan) {
      await Linking.openURL(wallet.networkManager.explorers.cardanoscan[type](id))
    } else {
      await Linking.openURL(wallet.networkManager.explorers.cexplorer[type](id))
    }
  }

  return (
    <View>
      <Space width="sm" />

      <Text style={styles.label}>{strings.details}</Text>

      <View style={styles.linkGroup}>
        <TouchableOpacity onPress={() => handleOpenLink(Explorers.Explorer.CardanoScan)}>
          <Text style={styles.link}>{explorerNames[Explorers.Explorer.CardanoScan]}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleOpenLink(Explorers.Explorer.CExplorer)}>
          <Text style={styles.link}>{explorerNames[Explorers.Explorer.CExplorer]}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const explorerNames = {
  [Explorers.Explorer.CardanoScan]: 'Cardanoscan',
  [Explorers.Explorer.CExplorer]: 'Adaex',
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    label: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    link: {
      ...atoms.link_1_lg_underline,
      color: color.text_primary_medium,
    },
    linkGroup: {
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
