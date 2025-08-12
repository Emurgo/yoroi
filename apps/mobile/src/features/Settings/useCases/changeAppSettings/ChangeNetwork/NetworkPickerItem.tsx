import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain, Network} from '@yoroi/types'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../../ui/Icon'
import {Text} from '../../../../../ui/Text/Text'

type Props = {
  name: Readonly<Network.Config['name']>
  itemNetwork: Chain.SupportedNetworks
  selectedNetwork: Chain.SupportedNetworks
  onSelectNetwork: (network: Chain.SupportedNetworks) => void
}

export const NetworkPickerItem = ({
  name,
  itemNetwork,
  selectedNetwork,
  onSelectNetwork,
}: Props) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => {
        onSelectNetwork(itemNetwork)
      }}
    >
      <Row>
        <Description>
          <Title>{name}</Title>
        </Description>

        <Selected>
          {itemNetwork === selectedNetwork && (
            <Icon.Check size={24} color={p.primary_600} />
          )}
        </Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[a.flex_row, {borderBottomColor: p.gray_200}, a.border_b, a.py_lg]}
    >
      {children}
    </View>
  )
}
const Description = ({children}: {children: React.ReactNode}) => {
  return <View style={[{flex: 8}, a.flex_col]}>{children}</View>
}
const Selected = ({children}: {children: React.ReactNode}) => {
  return (
    <View style={[a.align_end, a.justify_center, {flex: 2}]}>{children}</View>
  )
}
const Title = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()

  return (
    <Text
      style={[
        {
          color: p.gray_900,
        },
        a.body_1_lg_medium,
      ]}
    >
      {children}
    </Text>
  )
}
