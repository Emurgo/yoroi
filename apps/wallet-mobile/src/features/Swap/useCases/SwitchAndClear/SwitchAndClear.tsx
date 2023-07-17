import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../src/components/Icon'
import {COLORS} from '../../../../../src/theme'
import {useStrings} from '../../common/strings'

export const SwitchAndClear = () => {
  const strings = useStrings()
  return (
    <View style={[styles.container]}>
      <Icon.Switch size={24} />

      <TouchableOpacity>
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
