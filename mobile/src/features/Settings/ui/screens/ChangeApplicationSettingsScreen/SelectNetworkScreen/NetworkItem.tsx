import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain, Network} from '@yoroi/types'

import * as React from 'react'
import {Text, TouchableOpacity} from 'react-native'

import {Icon} from '~/ui/Icon'

type Props = {
  networkName: Readonly<Network.Config['name']>
  network: Chain.SupportedNetworks
  isSelected?: boolean
  onSelectNetwork: (network: Chain.SupportedNetworks) => void
}

export const NetworkItem = ({
  networkName,
  network,
  isSelected,
  onSelectNetwork,
}: Props) => {
  const {palette: p, atoms: ta} = useTheme()

  const handleSelectNetwork = () => {
    onSelectNetwork(network)
  }

  return (
    <TouchableOpacity
      onPress={handleSelectNetwork}
      style={[a.py_lg, a.flex_row, a.justify_between, a.align_center]}
    >
      <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>{networkName}</Text>

      {isSelected && <Icon.Check size={24} color={p.primary_600} />}
    </TouchableOpacity>
  )
}
