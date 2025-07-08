import {FlashList} from '@shopify/flash-list'
import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {features} from '../../../../kernel/features'
import {Space} from '../../../../ui/Space/Space'
import {useAddressMode} from '../../../WalletManager/hooks/useAddressMode'
import {useUtxoList} from './useUtxoList'
import {UtxoAddressGroup} from './UtxoAddressGroup'
import {WarningSingleAddress} from './WarningSingleAddress'
export const UtxoList = () => {
  const {utxoList} = useUtxoList()
  const {isSingle} = useAddressMode()

  if (utxoList === undefined) return null

  return (
    <View style={[a.flex, a.flex_1, a.p_lg]}>
      <FlashList
        data={utxoList}
        ListHeaderComponent={
          features.utxoConsolidation && utxoList.length > 1 && isSingle ? (
            <>
              <WarningSingleAddress />

              <Space.Height.lg />
            </>
          ) : null
        }
        renderItem={({item}) => <UtxoAddressGroup item={item} />}
        ItemSeparatorComponent={() => <Space.Height.lg />}
        keyExtractor={(item) => item.path}
        nestedScrollEnabled={true}
        testID="utxoList"
        estimatedItemSize={200}
      />
    </View>
  )
}
