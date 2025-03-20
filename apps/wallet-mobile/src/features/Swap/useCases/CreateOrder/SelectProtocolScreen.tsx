import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native'
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

  const data = Object.keys(
    swapAggregatorProtocols.reduce((acc, curr) => ({...acc, [curr.protocol]: true}), {}),
  ).sort() as Swap.Protocol[]
  const counter = data.length

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              swapForm.action({type: 'ProtocolSelected', value: item})
              navigation.goBack()
            }}
          >
            <View style={styles.row}>
              <ProtocolAvatar protocol={item} preventOpenLink />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
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
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_md,
    },
  })

  return styles
}
