import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {COLORS} from '../../../../../src/theme'
import {Icon, Spacer} from '../../../../components'
import {useNavigateTo} from '../navigation'
import {useStrings} from '../strings'

export const SlippageTolerance = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()

  return (
    <View style={[styles.container]}>
      <View style={styles.row}>
        <Text style={styles.label}>{strings.slippageTolerance}</Text>

        <Spacer width={4} />

        <Icon.Info size={24} />
      </View>

      <View style={styles.row}>
        <Text>1%</Text>

        <Spacer width={4} />

        <TouchableOpacity onPress={() => navigate.slippageToleranceInput()}>
          <Icon.Edit size={24} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
