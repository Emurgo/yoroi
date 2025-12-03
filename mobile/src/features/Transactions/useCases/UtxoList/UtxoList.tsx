import {atoms as a} from '@yoroi/theme'

import {FlashList} from '@shopify/flash-list'
import * as React from 'react'
import {View} from 'react-native'

import {useAddressMode} from '@yoroi/wallet-manager/hooks/useAddressMode'
import {features} from '~/kernel/features'
import {Space} from '~/ui/Space/Space'

import {UtxoAddressGroup} from './UtxoAddressGroup'
import {WarningSingleAddress} from './WarningSingleAddress'
import {UtxoList as UtxoListType, useUtxoList} from './useUtxoList'

export const UtxoList = () => {
  const {utxoList} = useUtxoList()
  const {isSingle} = useAddressMode()

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
      features.utxoConsolidation &&
      utxoList &&
      utxoList.length > 1 &&
      isSingle ? (
        <>
          <WarningSingleAddress />

          <Space.Height.lg />
        </>
      ) : null,
    [utxoList, isSingle],
  )

  if (utxoList === undefined || !Array.isArray(utxoList)) return null

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
