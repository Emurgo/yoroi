import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {Button, ButtonType} from '../Button/Button'
import {Space} from '../Space/Space'
import {useStrings} from './hooks/useStrings'

export const ExplorerInfoLinks = ({
  value,
  type,
}: {
  value: string
  type: keyof Explorers.Manager
}) => {
  const {color} = useTheme()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  if (type === 'token' && isPrimaryToken(value)) return null

  return (
    <View>
      <Space width="sm" />

      <Text style={[styles.label, {color: color.text_gray_low}]}>
        {strings.details}
      </Text>

      <View style={styles.linkGroup}>
        {Object.entries(Explorers.Explorer).map(([title, explorer]) => (
          <View key={explorer}>
            <Button
              type={ButtonType.Link}
              title={title}
              onPress={async () =>
                Linking.openURL(
                  wallet.networkManager.explorers[explorer][type](value),
                )
              }
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    ...a.body_2_md_regular,
  },
  linkGroup: {
    ...a.flex_row,
    ...a.gap_lg,
  },
})
