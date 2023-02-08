import * as React from 'react'
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewProps, ViewStyle} from 'react-native'

import {Icon} from '../../../components'
import {COLORS} from '../../../theme'
import {TokenId, TokenInfo} from '../../../yoroi-wallets/types'

export type DeleteTokenProps = {
  tokenInfo: TokenInfo
  children: React.ReactNode
  onDelete(tokenId: TokenId): void
  style?: StyleProp<ViewStyle>
}
export const DeleteToken = ({children, style, tokenInfo, onDelete}: DeleteTokenProps) => {
  return (
    <View style={[style, styles.container]} testID="deleteToken">
      <Left>{children}</Left>

      <Right>
        <DeleteButton onPress={() => onDelete(tokenInfo.id)} />
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {flex: 1}]} {...props} />
const Right = ({style, ...props}: ViewProps) => <View style={[style, {paddingLeft: 16}]} {...props} />

type DeleteButtonProps = {
  onPress(): void
  style?: StyleProp<ViewStyle>
}
const DeleteButton = ({onPress, style}: DeleteButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} testID="deleteTokenButton" style={style}>
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
