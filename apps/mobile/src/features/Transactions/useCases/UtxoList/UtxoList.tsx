import {FlashList} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {features} from '../../../../kernel/features'
import {useAddressMode} from '../../../WalletManager/common/hooks/useAddressMode'
import {useUtxoList} from './useUtxoList'
import {UtxoAddressGroup} from './UtxoAddressGroup'
import {WarningSingleAddress} from './WarningSingleAddress'
export const UtxoList = () => {
  const {styles} = useStyles()
  const {utxoList} = useUtxoList()
  const {isSingle} = useAddressMode()

  if (utxoList === undefined) return null

  return (
    <View style={styles.container}>
      <FlashList
        data={utxoList}
        ListHeaderComponent={
          features.utxoConsolidation && utxoList.length > 1 && isSingle ? (
            <>
              <WarningSingleAddress />

              <Space height="lg" />
            </>
          ) : null
        }
        renderItem={({item}) => <UtxoAddressGroup item={item} />}
        ItemSeparatorComponent={() => <Space height="lg" />}
        keyExtractor={(item) => item.path}
        nestedScrollEnabled={true}
        testID="utxoList"
        estimatedItemSize={200}
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.flex,
      ...atoms.flex_1,
      ...atoms.p_lg,
    },
  })

  return {styles}
}
