import {useTheme} from '@yoroi/theme'
import {Chain, Network} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Text} from '../../../components/Text'

type Props = {
  name: Readonly<Network.Config['name']>
  itemNetwork: Chain.SupportedNetworks
  selectedNetwork: Chain.SupportedNetworks
  onSelectNetwork: (network: Chain.SupportedNetworks) => void
}

export const NetworkPickerItem = ({name, itemNetwork, selectedNetwork, onSelectNetwork}: Props) => {
  const {colors} = useStyles()

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

        <Selected>{itemNetwork === selectedNetwork && <Icon.Check size={24} color={colors.checkIcon} />}</Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.row}>{children}</View>
}
const Description = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.description}>{children}</View>
}
const Selected = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.flag}>{children}</View>
}
const Title = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <Text style={styles.bodyMedium}>{children}</Text>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomColor: color.gray_c200,
      borderBottomWidth: 1,
      ...atoms.py_lg,
    },
    flag: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      flex: 2,
    },
    description: {
      flex: 8,
      flexDirection: 'column',
    },
    bodyMedium: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
  })
  const colors = {
    checkIcon: color.primary_c600,
  }
  return {styles, colors}
}
