import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Counter} from '../../../ui/Counter/Counter'
import {ProtocolAvatar} from '../../../ui/ProtocolAvatar/ProtocolAvatar'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {undefinedToken} from '../../common/constants'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const SelectProtocolScreen = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {limitOptions, ...swapForm} = useSwap()
  const {color} = useTheme()

  if (limitOptions === undefined) return null

  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const formatPrice = (price: number) => {
    const roundedPrice = price
      .toFixed(tokenOutInfo?.decimals ?? 0)
      .replace(/\.0+$/, '')
    return roundedPrice !== '0' ? roundedPrice : price.toFixed(6)
  }

  const data = limitOptions.options
  const counter = data.length

  return (
    <SafeAreaView
      style={[styles.root, {backgroundColor: color.bg_color_max}]}
      edges={['left', 'right', 'bottom']}
    >
      <FlatList
        contentContainerStyle={[styles.list, a.p_lg, a.gap_md]}
        data={data}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              swapForm.action({
                type: 'WantedPriceInputChanged',
                value: String(item.initialPrice),
              })
              swapForm.action({type: 'ProtocolSelected', value: item.protocol})
              navigation.goBack()
            }}
          >
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0.5}}
              colors={
                item.protocol === swapForm.selectedProtocol.value
                  ? color.bg_gradient_1
                  : ['transparent', 'transparent']
              }
              style={[
                styles.card,
                a.p_lg,
                a.relative,
                a.rounded_sm,
                a.gap_lg,
                !(item.protocol === swapForm.selectedProtocol.value) &&
                  styles.border,
                !(item.protocol === swapForm.selectedProtocol.value) &&
                  a.border,
                !(item.protocol === swapForm.selectedProtocol.value) && {
                  borderColor: color.gray_200,
                },
              ]}
            >
              <View
                style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}
              >
                <ProtocolAvatar protocol={item.protocol} preventOpenLink />
              </View>

              <View
                style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}
              >
                <Text style={[styles.rowLabel, {color: color.text_gray_low}]}>
                  {strings.price}
                </Text>

                <Text
                  style={[styles.rowValue, {color: color.text_gray_medium}]}
                >{`1 ${tokenInTicker} = ${formatPrice(
                  item.initialPrice,
                )} ${tokenOutTicker}`}</Text>
              </View>

              <View
                style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}
              >
                <Text style={[styles.rowLabel, {color: color.text_gray_low}]}>
                  {strings.batcherFee}
                </Text>

                <Text
                  style={[styles.rowValue, {color: color.text_gray_medium}]}
                >{`${item.batcherFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.protocol}
      />

      <Counter
        counter={counter}
        unitsText={strings.pools(counter)}
        closingText={strings.available}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {},
  list: {},
  card: {},
  border: {},
  row: {},
  rowLabel: {
    ...a.body_1_lg_regular,
  },
  rowValue: {
    ...a.body_1_lg_regular,
    ...a.self_center,
  },
})
