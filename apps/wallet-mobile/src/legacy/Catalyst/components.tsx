import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TextProps, View, ViewProps} from 'react-native'

import {Text} from '../../components'

export const Title = ({style, ...props}: TextProps) => {
  const styles = useStyles()

  return <Text {...props} style={[styles.title, style]} />
}
export const Description = ({style, ...props}: TextProps) => {
  const styles = useStyles()

  return <Text {...props} style={[styles.description, style]} />
}

export const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()

  return <View {...props} style={[styles.actions, style]} />
}
export const Instructions = (props: ViewProps) => <View {...props} />
export const Row = ({style, ...props}: ViewProps) => {
  const styles = useStyles()

  return <View {...props} style={[styles.row, style]} />
}

export const PinBox = ({selected, children}: {selected?: boolean; children: React.ReactNode}) => {
  const styles = useStyles()

  return (
    <View style={[styles.pinBox, selected && styles.pinBoxSelected]}>
      <PinDigit>{children}</PinDigit>
    </View>
  )
}
export const PinDigit = ({style, ...props}: TextProps) => <Text {...props} style={[styles.pinDigit, style]} />

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...atoms.heading_4_medium,
      color: color.gray_c900,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    row: {
      flexDirection: 'row',
    },
    actions: {
      ...atoms.p_lg,
    },
    pinBox: {
      borderWidth: 1,
      height: 60,
      width: 60,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: color.gray_c900,
    },
    pinDigit: {
      fontSize: 20,
      lineHeight: 22,
    },
    pinBoxSelected: {
      borderWidth: 2,
      borderColor: '#4A5065',
    },
  })

  return styles
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7384',
  },
  description: {
    fontSize: 14,
    color: '#242838',
  },
  row: {
    flexDirection: 'row',
  },
  actions: {
    padding: 16,
  },
  pinBox: {
    borderWidth: 1,
    height: 60,
    width: 60,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#9B9B9B',
  },
  pinDigit: {
    fontSize: 20,
    lineHeight: 22,
    color: '#353535',
  },
  pinBoxSelected: {
    borderWidth: 2,
    borderColor: '#4A5065',
  },
})
