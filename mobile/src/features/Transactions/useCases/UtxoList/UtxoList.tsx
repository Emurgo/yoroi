import {atoms as a, useTheme} from '@yoroi/theme'
import {useAddressMode} from '@yoroi/wallet-manager'

import {FlashList} from '@shopify/flash-list'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

import {UtxoAddressGroup} from './UtxoAddressGroup'
import {WarningSingleAddress} from './WarningSingleAddress'
import {UtxoList as UtxoListType, useUtxoList} from './useUtxoList'

export const UtxoList = () => {
  const {utxoList} = useUtxoList()
  const {isSingle} = useAddressMode()
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const renderItem = React.useCallback(
    ({item}: {item: UtxoListType[number]}) => <UtxoAddressGroup item={item} />,
    [],
  )

  const ItemSeparator = React.useCallback(() => <Space.Height.lg />, [])

  const keyExtractor = React.useCallback(
    (item: UtxoListType[number]) => item.path,
    [],
  )

  const ListHeaderComponent = React.useMemo(
    () =>
      utxoList && utxoList.length > 1 && isSingle ? (
        <>
          <WarningSingleAddress />

          <Space.Height.lg />
        </>
      ) : null,
    [utxoList, isSingle],
  )

  const ListEmptyComponent = React.useCallback(
    () => (
      <View style={[a.flex_1, a.justify_center, a.align_center, a.pt_2xl]}>
        <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
          {strings.transactions.utxo.noUtxos}
        </Text>
      </View>
    ),
    [strings.transactions.utxo.noUtxos, ta.text_gray_max],
  )

  if (utxoList === undefined || !Array.isArray(utxoList)) return null

  if (utxoList.length === 0) {
    return (
      <View style={[a.flex, a.flex_1, a.p_lg]}>
        <ListEmptyComponent />
      </View>
    )
  }

  return (
    <View style={[a.flex, a.flex_1, a.p_lg]}>
      <FlashList
        data={utxoList}
        ListHeaderComponent={ListHeaderComponent}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
        nestedScrollEnabled={true}
        testID="utxoList"
        estimatedItemSize={200}
      />
    </View>
  )
}
