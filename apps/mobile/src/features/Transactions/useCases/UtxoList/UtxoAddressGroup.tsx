import {FlashList} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Copiable} from '../../../../components/Clipboard/Copiable'
import {Space} from '../../../../components/Space/Space'
import {UtxoList} from './useUtxoList'
import {UtxoItem} from './UtxoItem'
export const UtxoAddressGroup = ({item}: {item: UtxoList[number]}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Linking.openURL('https://cips.cardano.org/cip/CIP-1852')}>
          <Text style={styles.path}>{item.path}</Text>
        </TouchableOpacity>

        <Copiable text={item.address}>
          <View style={{flex: 1}}>
            <Text numberOfLines={1} ellipsizeMode="middle">
              <Text style={styles.address}>{item.address.slice(0, -6)}</Text>

              <Text style={styles.tail}> {item.address.slice(-6)}</Text>
            </Text>
          </View>
        </Copiable>
      </View>

      <FlashList
        data={item.utxos}
        renderItem={({item}) => <UtxoItem item={item} />}
        ItemSeparatorComponent={() => <Space height="md" />}
        keyExtractor={(item) => `${item.txHash}#${item.txIndex}`}
        nestedScrollEnabled={true}
        testID="utxoList"
        estimatedItemSize={32 * item.utxos.length + 64}
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.flex,
      ...atoms.flex_1,
    },
    header: {
      ...atoms.p_md,
      ...atoms.rounded_sm,
      backgroundColor: color.bg_color_min,
    },
    address: {
      ...atoms.body_2_md_regular,
      color: color.el_gray_medium,
    },
    tail: {
      ...atoms.body_2_md_medium,
      color: color.primary_500,
    },
    path: {
      ...atoms.body_3_sm_medium,
      color: color.el_gray_max,
    },
  })

  return {styles}
}
