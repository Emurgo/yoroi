import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../components/Icon'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../../../common/strings'

type SwitchAndClearProps = {
  onClear: () => void
}

export const SwitchAndClear = ({onClear}: SwitchAndClearProps) => {
  const strings = useStrings()
  const {switchTokens} = useSwap()

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={() => switchTokens()}>
        <Icon.Switch size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          onClear()
        }}
      >
        <Text style={styles.text}>{strings.clear}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {color: COLORS.SHELLEY_BLUE, fontWeight: '500'},
})
