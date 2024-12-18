import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Counter} from '../../common/Counter/Counter'
import {Provider} from '../../common/Provider/Provider'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const SelectProviderScreen = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {providers, ...swapForm} = useSwap()
  const styles = useStyles()

  const providersCounter = Array.isArray(providers) ? providers.length : 0

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={providers}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              swapForm.dispatch({type: 'DexSelectorTouched', value: item.provider})
              navigation.goBack()
            }}
          >
            <Provider provider={item.provider} noLink />

            <Text style={styles.aggregator}>{item.aggregator}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.aggregator}${item.provider}`}
      />

      <Counter counter={providersCounter} unitsText={strings.pools(providersCounter)} closingText={strings.available} />
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
    },
  })

  return styles
}
