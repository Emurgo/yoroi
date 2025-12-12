import {atoms as a, useTheme} from '@yoroi/theme'

import {FlashList} from '@shopify/flash-list'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'

import {Address} from '~/common/Address/Address'
import {Space} from '~/ui/Space/Space'

import {UtxoItem} from './UtxoItem'
import {UtxoList} from './useUtxoList'

const UtxoAddressGroupComponent = ({item}: {item: UtxoList[number]}) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={[a.flex, a.flex_1]}>
      <View style={[a.p_md, a.rounded_sm, {backgroundColor: p.bg_color_min}]}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://cips.cardano.org/cip/CIP-1852')
          }
        >
          <Text style={[a.body_3_sm_medium, ta.text_gray_max]}>
            {item.path}
          </Text>
        </TouchableOpacity>

        <Space.Height.xs />

        <Address address={item.address} />
      </View>

      <FlashList
        data={item.utxos}
        renderItem={({item}) => <UtxoItem item={item} />}
        ItemSeparatorComponent={() => <Space.Height.md />}
        keyExtractor={(item) => `${item.txHash}#${item.txIndex}`}
        nestedScrollEnabled={true}
        testID="utxoList"
        estimatedItemSize={32 * item.utxos.length + 64}
      />
    </View>
  )
}

export const UtxoAddressGroup = React.memo(
  UtxoAddressGroupComponent,
  (prevProps, nextProps) => {
    // Only re-render if path or address changes
    return (
      prevProps.item.path === nextProps.item.path &&
      prevProps.item.address === nextProps.item.address &&
      prevProps.item.utxos.length === nextProps.item.utxos.length
    )
  },
)
