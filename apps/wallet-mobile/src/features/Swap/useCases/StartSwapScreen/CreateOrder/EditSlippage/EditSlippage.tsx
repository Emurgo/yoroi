import {useSwap} from '@yoroi/swap'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {COLORS} from '../../../../../../theme'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {BottomSheetState} from '../CreateOrder'

export const EditSlippage = ({openBottomSheet}: {openBottomSheet: ({title, content}: BottomSheetState) => void}) => {
  const navigate = useNavigateTo()
  const {createOrder} = useSwap()

  return (
    <View style={styles.container}>
      <ShowSlippageInfo openBottomSheet={openBottomSheet} />

      <View style={styles.row}>
        <Text>{`${createOrder.slippage} %`}</Text>

        <Spacer width={4} />

        <TouchableOpacity onPress={() => navigate.editSlippage()}>
          <Icon.Edit size={24} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const ShowSlippageInfo = ({openBottomSheet}: {openBottomSheet: ({title, content}: BottomSheetState) => void}) => {
  const strings = useStrings()

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{strings.slippageTolerance}</Text>

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => {
          openBottomSheet({
            title: strings.slippageTolerance,
            content: strings.slippageToleranceInfo,
          })
        }}
      >
        <Icon.Info size={24} />
      </TouchableOpacity>
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
  label: {
    fontSize: 12,
    color: COLORS.TEXT_INPUT,
  },
})
