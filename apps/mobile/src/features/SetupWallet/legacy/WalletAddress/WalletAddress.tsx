import {useExplorers} from '@yoroi/explorers'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {Copiable} from '~/ui/Copiable/Copiable'

export const WalletAddress = ({
  addressHash,
  style,
}: {
  addressHash: string
  style?: ViewStyle
}) => {
  const {network} = useSelectedNetwork()
  const explorers = useExplorers(network)
  const handleOnPress = () => {
    Linking.openURL(explorers.cardanoscan.address(addressHash))
  }

  return (
    <View
      style={[
        {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
        style,
      ]}
    >
      <Copiable text={addressHash}>
        <TouchableOpacity activeOpacity={0.5} onPress={handleOnPress}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[{width: 280, color: '#9B9B9B', lineHeight: 30}]}
          >
            {addressHash}
          </Text>
        </TouchableOpacity>
      </Copiable>
    </View>
  )
}
