import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Explorers} from '@yoroi/types'
import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

export const ExplorerInfoLinks = ({
  value,
  type,
}: {
  value: string
  type: keyof Explorers.Manager
}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const strings = {details: 'Details on'}

  if (type === 'token' && isPrimaryToken(value)) return null

  return (
    <View>
      <Space.Width.sm />

      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        {strings.details}
      </Text>

      <View style={[a.flex_row, a.gap_lg]}>
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
