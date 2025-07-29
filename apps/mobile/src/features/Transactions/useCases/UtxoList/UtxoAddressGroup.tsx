import {FlashList} from '@shopify/flash-list'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'

import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'
import {UtxoList} from './useUtxoList'
import {UtxoItem} from './UtxoItem'
export const UtxoAddressGroup = ({item}: {item: UtxoList[number]}) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex, a.flex_1]}>
      <View style={[a.p_md, a.rounded_sm, {backgroundColor: p.bg_color_min}]}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://cips.cardano.org/cip/CIP-1852')
          }
        >
          <Text style={[a.body_3_sm_medium, {color: p.el_gray_max}]}>
            {item.path}
          </Text>
        </TouchableOpacity>

        <Copiable text={item.address}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} ellipsizeMode="middle">
              <Text style={[a.body_2_md_regular, {color: p.el_gray_medium}]}>
                {item.address.slice(0, -6)}
              </Text>

              <Text style={[a.body_2_md_medium, {color: p.primary_500}]}>
                {' '}
                {item.address.slice(-6)}
              </Text>
            </Text>
          </View>
        </Copiable>
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
