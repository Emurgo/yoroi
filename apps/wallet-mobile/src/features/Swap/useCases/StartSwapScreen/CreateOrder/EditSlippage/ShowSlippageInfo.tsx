import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer, useModal} from '../../../../../../components'
import {COLORS} from '../../../../../../theme'
import {useStrings} from '../../../../common/strings'

export const ShowSlippageInfo = () => {
  const strings = useStrings()
  const {openModal} = useModal()

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{strings.slippageTolerance}</Text>

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => {
          openModal(strings.slippageTolerance, <Text style={styles.sheetContent}>{strings.slippageToleranceInfo}</Text>)
        }}
      >
        <Icon.Info size={24} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT_INPUT,
    fontFamily: 'Rubik',
  },
  sheetContent: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
})
