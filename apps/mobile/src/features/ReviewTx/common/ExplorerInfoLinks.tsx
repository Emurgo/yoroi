import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../components/Button/Button'
import {Space} from '../../../components/Space/Space'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './hooks/useStrings'

export const ExplorerInfoLinks = ({value, type}: {value: string; type: keyof Explorers.Manager}) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  if (type === 'token' && isPrimaryToken(value)) return null

  return (
    <View>
      <Space width="sm" />

      <Text style={styles.label}>{strings.details}</Text>

      <View style={styles.linkGroup}>
        {Object.entries(Explorers.Explorer).map(([title, explorer]) => (
          <View key={explorer}>
            <Button
              type={ButtonType.Link}
              title={title}
              onPress={async () => Linking.openURL(wallet.networkManager.explorers[explorer][type](value))}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    label: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
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
