import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {useSelectedNetwork} from '@yoroi/wallet-manager'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'

type Params = {
  hash?: string
  height?: string
}

const Label = ({children}: {children: string}) => {
  const {atoms: ta} = useTheme()

  return (
    <Text
      style={[
        a.pt_lg,
        a.body_2_md_regular,
        ta.text_gray_medium,
        {marginBottom: 8},
      ]}
    >
      {children}
    </Text>
  )
}

const getBlockExplorerUrl = (
  network: Chain.SupportedNetworks,
  explorer: 'cardanoscan' | 'cexplorer',
  hash?: string,
  height?: string,
): string => {
  const baseUrls: Record<
    Chain.SupportedNetworks,
    Record<'cardanoscan' | 'cexplorer', string>
  > = {
    [Chain.Network.Mainnet]: {
      cardanoscan: 'https://cardanoscan.io',
      cexplorer: 'https://cexplorer.io',
    },
    [Chain.Network.Preprod]: {
      cardanoscan: 'https://preprod.cardanoscan.io',
      cexplorer: 'https://preprod.cexplorer.io',
    },
  }

  const baseUrl = baseUrls[network][explorer]
  if (hash) {
    return `${baseUrl}/block/${hash}`
  }
  if (height) {
    return `${baseUrl}/block/${height}`
  }
  return baseUrl
}

export const BlockDetails = () => {
  const {hash, height} = useRoute().params as Params
  const {network} = useSelectedNetwork()
  const {scrollViewRef} = useScrollView()

  const identifier = hash || height || 'Unknown'
  const identifierLabel = hash ? 'Block Hash' : 'Block Height'

  const cardanoscanUrl = getBlockExplorerUrl(
    network,
    'cardanoscan',
    hash,
    height,
  )
  const cexplorerUrl = getBlockExplorerUrl(network, 'cexplorer', hash, height)

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
        <Label>{identifierLabel}</Label>

        <Copiable title={identifier} text={identifier} />
      </ScrollView>

      <SafeArea.Footer>
        <View style={[a.flex_row, a.gap_lg, a.justify_center]}>
          <Button
            type={ButtonType.Secondary}
            onPress={() => Linking.openURL(cardanoscanUrl)}
            title="Cardanoscan"
          />
          <Button
            type={ButtonType.Secondary}
            onPress={() => Linking.openURL(cexplorerUrl)}
            title="Cexplorer"
          />
        </View>
      </SafeArea.Footer>
    </SafeArea>
  )
}
