import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {useModal} from '../../../../../../features/Modal/ModalContext'
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
    fontSize: 12,
    color: COLORS.TEXT_INPUT,
  },
  sheetContent: {
    fontSize: 16,
    color: '#242838',
    lineHeight: 24,
    fontWeight: '400',
  },
})
