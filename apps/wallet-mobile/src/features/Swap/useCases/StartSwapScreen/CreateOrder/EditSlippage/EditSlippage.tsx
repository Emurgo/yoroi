import {useSwap} from '@yoroi/swap'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {useNavigateTo} from '../../../../common/navigation'

export const EditSlippage = () => {
  const navigate = useNavigateTo()
  const {createOrder} = useSwap()

  return (
    <View style={styles.container}>
      <Text>{`${createOrder.slippage} %`}</Text>

      <Spacer width={4} />

      <TouchableOpacity onPress={() => navigate.editSlippage()}>
        <Icon.Edit size={24} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
