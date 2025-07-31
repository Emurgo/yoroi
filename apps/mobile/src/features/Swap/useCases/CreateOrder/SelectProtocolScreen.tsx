import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useSwap} from '~/features/Swap/common/SwapProvider'
import {useStrings} from '~/features/Swap/common/useStrings'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Counter} from '~/ui/Counter/Counter'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'

export const SelectProtocolScreen = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {limitOptions, ...swapForm} = useSwap()
  const {palette: p} = useTheme()

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
      style={[{backgroundColor: p.bg_color_max}]}
      edges={['left', 'right', 'bottom']}
    >
      <FlatList
        contentContainerStyle={[a.p_lg, a.gap_md]}
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
                  ? p.bg_gradient_1
                  : ['transparent', 'transparent']
              }
              style={[
                a.p_lg,
                a.relative,
                a.rounded_sm,
                a.gap_lg,
                !(item.protocol === swapForm.selectedProtocol.value) &&
                  a.border,
                !(item.protocol === swapForm.selectedProtocol.value) && {
                  borderColor: p.gray_200,
                },
              ]}
            >
              <View style={[a.flex_row, a.justify_between, a.gap_md]}>
                <ProtocolAvatar protocol={item.protocol} preventOpenLink />
              </View>

              <View style={[a.flex_row, a.justify_between, a.gap_md]}>
                <Text style={[a.body_1_lg_regular, {color: p.text_gray_low}]}>
                  {strings.price}
                </Text>

                <Text
                  style={[
                    a.body_1_lg_regular,
                    a.self_center,
                    {color: p.text_gray_medium},
                  ]}
                >
                  {`1 ${tokenInTicker} = ${formatPrice(item.initialPrice)} ${tokenOutTicker}`}
                </Text>
              </View>

              <View style={[a.flex_row, a.justify_between, a.gap_md]}>
                <Text style={[a.body_1_lg_regular, {color: p.text_gray_low}]}>
                  {strings.batcherFee}
                </Text>

                <Text
                  style={[
                    a.body_1_lg_regular,
                    a.self_center,
                    {color: p.text_gray_medium},
                  ]}
                >
                  {`${item.batcherFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
                </Text>
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
