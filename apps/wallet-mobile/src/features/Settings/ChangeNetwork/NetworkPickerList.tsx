import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {NetworkLabel} from '../../WalletManager/common/constants'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {ThemePickerItem} from './NetworkPickerItem'

export const NetworkPickerList = () => {
  const {walletManager} = useWalletManager()
  const {styles} = useStyles()

  const onSelectNetwork = (network: Chain.SupportedNetworks) => {
    walletManager.setSelectedNetwork(network)
  }

  const data = Object.entries(NetworkLabel) as Array<[Chain.SupportedNetworks, string]>

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={([networkKey]) => networkKey}
      renderItem={({item: [network, networkLabel]}) => (
        <ThemePickerItem label={networkLabel} itemNetwork={network} onSelectNetwork={onSelectNetwork} />
      )}
    />
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    contentContainer: {
      ...atoms.p_lg,
    },
  })

  return {styles}
}
