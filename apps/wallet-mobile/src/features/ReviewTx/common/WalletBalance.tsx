import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Space} from '../../../components/Space/Space'
import {BalanceCard} from '../../Portfolio/useCases/PortfolioDashboard/BalanceCard/BalanceCard'

export const WalletBalance = ({image, plate, name}: {image: string; plate: string; name: string}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <View style={{alignItems: 'center'}}>
        <Icon.WalletAvatar style={styles.walletChecksum} image={image} size={80} />
      </View>

      <Space height="sm" />

      <View style={{alignItems: 'center'}}>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={{alignItems: 'center'}}>
        <Text style={styles.plate}>{plate}</Text>
      </View>

      <Space height="lg" />

      <BalanceCard />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    walletChecksum: {
      height: 80,
      width: 80,
    },
    name: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    plate: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
