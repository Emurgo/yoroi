import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Counter} from '../../common/Counter/Counter'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const SelectProtocolScreen = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {swapAggregatorProtocols, ...swapForm} = useSwap()
  const styles = useStyles()

  const counter = swapAggregatorProtocols.length

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={swapAggregatorProtocols}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              swapForm.action({type: 'ProtocolSelected', value: item.protocol})
              navigation.goBack()
            }}
          >
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{item.aggregator}</Text>

              <ProtocolAvatar protocol={item.protocol} preventOpenLink />

              <Text style={styles.aggregator}>{item.aggregator}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.aggregator}${item.protocol}`}
      />

      <Counter counter={counter} unitsText={strings.pools(counter)} closingText={strings.available} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    list: {
      ...atoms.p_lg,
      ...atoms.gap_md,
    },
    card: {
      ...atoms.p_lg,
      ...atoms.border,
      borderRadius: 8,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
    },
    aggregator: {
      ...atoms.body_3_sm_medium,
      color: color.text_gray_min,
      alignSelf: 'flex-start',
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_md,
    },
    rowLabel: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
  })

  return styles
}
