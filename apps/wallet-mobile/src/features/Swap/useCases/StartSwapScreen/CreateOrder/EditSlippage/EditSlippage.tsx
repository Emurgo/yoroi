import {useSwap} from '@yoroi/swap'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {useNavigateTo} from '../../../../common/navigation'
import {ShowSlippageInfo} from './ShowSlippageInfo'

export const EditSlippage = () => {
  const navigate = useNavigateTo()
  const {orderData} = useSwap()

  return (
    <View style={styles.container}>
      <ShowSlippageInfo />

      <View style={styles.row}>
        <Text>{`${orderData.slippage} %`}</Text>

        <Spacer width={4} />

        <TouchableOpacity onPress={() => navigate.editSlippage()}>
          <Icon.Edit size={24} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
