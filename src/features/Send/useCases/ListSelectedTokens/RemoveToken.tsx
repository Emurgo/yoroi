import * as React from 'react'
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewProps, ViewStyle} from 'react-native'

import {Icon} from '../../../../components'
import {COLORS} from '../../../../theme'

export type DeleteTokenProps = {
  tokenId: string
  children: React.ReactNode
  onDelete(tokenId: string): void
  style?: StyleProp<ViewStyle>
}
export const RemoveToken = ({children, style, tokenId, onDelete}: DeleteTokenProps) => {
  return (
    <View style={[style, styles.container]} testID="deleteToken">
      <Left>{children}</Left>

      <Right>
        <DeleteButton onPress={() => onDelete(tokenId)} />
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {flex: 1}]} {...props} />
const Right = ({style, ...props}: ViewProps) => <View style={[style, {paddingLeft: 16}]} {...props} />

type DeleteButtonProps = {
  onPress(): void
}
const DeleteButton = ({onPress}: DeleteButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} testID="deleteTokenButton">
      <Icon.Delete size={26} color={COLORS.BLACK} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
