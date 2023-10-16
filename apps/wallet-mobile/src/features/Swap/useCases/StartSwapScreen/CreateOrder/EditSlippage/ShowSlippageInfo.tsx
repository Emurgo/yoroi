import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../../components'
import {BottomSheetModal} from '../../../../../../legacy/BottomSheetModal'
import {COLORS} from '../../../../../../theme'
import {useStrings} from '../../../../common/strings'

export const ShowSlippageInfo = () => {
  const [showInfo, setShowInfo] = React.useState(false)
  const strings = useStrings()

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{strings.slippageTolerance}</Text>

      <Spacer width={4} />

      <TouchableOpacity
        onPress={() => {
          setShowInfo(true)
        }}
      >
        <Icon.Info size={24} />
      </TouchableOpacity>

      <BottomSheetModal title={strings.slippageTolerance} isOpen={showInfo} onClose={() => setShowInfo(false)}>
        <Text style={styles.sheetContent}>{strings.slippageToleranceInfo}</Text>
      </BottomSheetModal>
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
