import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {undefinedToken} from '../../common/constants'
import {Counter} from '../../common/Counter/Counter'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const SelectProtocolScreen = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {limitOptions, ...swapForm} = useSwap()
  const {styles, colors} = useStyles()

  if (limitOptions === undefined) return null

  const tokenInInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken)
  const tokenOutInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-'

  const formatPrice = (price: number) => {
    const roundedPrice = price.toFixed(tokenOutInfo?.decimals ?? 0).replace(/\.0+$/, '')
    return roundedPrice !== '0' ? roundedPrice : price.toFixed(6)
  }

  const data = limitOptions.options
  const counter = data.length

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              swapForm.action({type: 'ProtocolSelected', value: item.protocol})
              navigation.goBack()
            }}
          >
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0.5}}
              colors={
                item.protocol === swapForm.selectedProtocol.value
                  ? colors.gradient
                  : [colors.baseGradient, colors.baseGradient]
              }
              style={[styles.card, !(item.protocol === swapForm.selectedProtocol.value) && styles.border]}
            >
              <View style={styles.row}>
                <ProtocolAvatar protocol={item.protocol} preventOpenLink />
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>{strings.price}</Text>

                <Text style={styles.rowValue}>{`1 ${tokenInTicker} = ${formatPrice(
                  item.initialPrice,
                )} ${tokenOutTicker}`}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>{strings.batcherFee}</Text>

                <Text style={styles.rowValue}>{`${item.batcherFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.protocol}
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
      ...atoms.relative,
      ...atoms.rounded_sm,
      ...atoms.gap_lg,
    },
    border: {
      ...atoms.border,
      borderColor: color.gray_200,
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
      color: color.text_gray_medium,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
    baseGradient: 'transparent',
  }

  return {styles, colors}
}
