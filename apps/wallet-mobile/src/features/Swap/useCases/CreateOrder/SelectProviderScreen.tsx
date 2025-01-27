import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {primaryTokenInfoMainnet} from '../../../WalletManager/network-manager/network-manager'
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
            <View style={styles.row}>
              <Provider provider={item.provider} noLink />

              <Text style={styles.aggregator}>{item.aggregator}</Text>
            </View>

            {item.batcherFee !== undefined && (
              <Row
                label={strings.batcherFee}
                value={`${item.batcherFee.toFixed(2)} ${primaryTokenInfoMainnet.ticker}`}
              />
            )}

            {item.deposit !== undefined && (
              <Row
                label={strings.swapMinAdaTitle}
                value={`${item.deposit.toFixed(2)} ${primaryTokenInfoMainnet.ticker}`}
              />
            )}

            {item.poolId !== undefined && (
              <View>
                <Text style={styles.rowLabel}>{strings.listOrdersLiquidityPool}</Text>

                <Text style={styles.rowValue}>{item.poolId}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `${item.aggregator}${item.provider}${item.poolId}`}
      />

      <Counter counter={providersCounter} unitsText={strings.pools(providersCounter)} closingText={strings.available} />
    </SafeAreaView>
  )
}

const Row = ({label, value}: {label: string; value: string}) => {
  const styles = useStyles()

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    rowValue: {
      ...atoms.body_1_lg_regular,
      ...atoms.self_center,
      ...atoms.flex_shrink,
      color: color.text_gray_medium,
    },
  })

  return styles
}
