import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../components/Icon'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../../../common/strings'

// TODO: we need to define if the switch is a helper from useSwap it should be built in the package/swap
export const SwitchAndClear = () => {
  const strings = useStrings()
  const {resetState, toAmountChanged} = useSwap()

  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        onPress={() => {
          // switchTokens()
        }}
      >
        <Icon.Switch size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          resetState()
          toAmountChanged({tokenId: 'noTokenSelected', quantity: '0'})
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
