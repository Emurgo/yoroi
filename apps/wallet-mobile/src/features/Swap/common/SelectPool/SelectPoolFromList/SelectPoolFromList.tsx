import {getMarketPrice, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../../components'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../navigation'
import {PoolIcon} from '../../PoolIcon/PoolIcon'
import {useStrings} from '../../strings'
import {useSwapForm} from '../../SwapFormProvider'

const PRECISION = 10

type Props = {
  pools?: ReadonlyArray<Swap.Pool>
}
export const SelectPoolFromList = ({pools = []}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {selectedPoolChanged, orderData} = useSwap()
  const {poolTouched} = useSwapForm()
  const [selectedCardIndex, setSelectedCardIndex] = useState(orderData.selectedPoolId)
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {styles, colors} = useStyles()

  const sellTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})
  const buyTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})
  const denomination = (sellTokenInfo.decimals ?? 0) - (buyTokenInfo.decimals ?? 0)
  const tokenToSellName = sellTokenInfo.ticker ?? sellTokenInfo.name
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name

  const handleOnPoolSelection = (pool: Swap.Pool) => {
    track.swapPoolChanged()
    selectedPoolChanged(pool.poolId)
    setSelectedCardIndex(pool.poolId)
    poolTouched()
    navigate.startSwap()
  }

  const decimals = wallet.primaryTokenInfo.decimals ?? 0
  const ticker = wallet.primaryTokenInfo.ticker

  const protocolCapitalize = (protocol: string): string => protocol[0].toUpperCase() + protocol.substring(1)

  return (
    <View style={styles.container}>
      {pools.map((pool) => {
        // TODO: Needs review and move to package
        const tvl = asQuantity(
          new BigNumber(pool.tokenA.quantity).dividedBy(new BigNumber(pool.ptPriceTokenA)).multipliedBy(2).toString(),
        )
        const formattedTvl = Quantities.format(tvl, decimals, 0)
        const formattedBatcherFeeInPt = Quantities.format(pool.batcherFee.quantity, decimals, decimals)
        const marketPrice = getMarketPrice(pool, orderData.amounts.sell.tokenId)
        const selectedPoolId = selectedCardIndex ?? orderData?.bestPoolCalculation?.pool?.poolId ?? null

        return (
          <View key={pool.poolId}>
            <Spacer height={16} />

            <View style={[styles.shadowProp]}>
              <LinearGradient
                colors={pool.poolId === selectedPoolId ? colors.gradientColor : [colors.white, colors.white]}
                style={styles.linearGradient}
              >
                <TouchableOpacity key={pool.poolId} onPress={() => handleOnPoolSelection(pool)} style={[styles.card]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.icon}>
                      <PoolIcon size={40} providerId={pool.provider} />
                    </View>

                    <Text style={styles.label}>{protocolCapitalize(pool.provider)}</Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.marketPrice}</Text>

                        <Text style={styles.infoValue}>
                          {`${Quantities.format(
                            marketPrice ?? Quantities.zero,
                            denomination,
                            PRECISION,
                          )} ${tokenToSellName}/${tokenToBuyName}`}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.tvl}</Text>

                        <Text style={styles.infoValue}>{`${formattedTvl} ${ticker}`}</Text>
                      </View>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.poolFee}</Text>

                        <Text style={styles.infoValue}>{`${formattedBatcherFeeInPt} ${ticker}`}</Text>
                      </View>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.swapLiquidityFee}</Text>

                        <Text style={styles.infoValue}>{pool.fee} %</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      flexDirection: 'column',
      backgroundColor: color.gray_cmin,
      flex: 1,
      paddingBottom: 30,
    },
    linearGradient: {
      borderRadius: 8,
    },
    card: {
      padding: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    shadowProp: {
      shadowColor: color.gray_cmax,
      shadowOpacity: 0.2,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 1.41,
      elevation: 1.2,
      backgroundColor: 'white',
      borderRadius: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 8,
    },
    icon: {
      marginRight: 8,
      fontSize: 24,
    },
    label: {
      ...atoms.body_1_lg_medium,
    },
    infoContainer: {
      flexDirection: 'column',
    },
    info: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 4,
    },
    infoLabel: {
      color: color.gray_c600,
      fontSize: 16,
      fontFamily: 'Rubik-Regular',
    },
    infoValue: {
      fontSize: 16,
      color: color.gray_cmax,
      fontFamily: 'Rubik-Regular',
      display: 'flex',
      flexShrink: 1,
      textAlign: 'right',
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
    white: color.gray_cmin,
  }

  return {styles, colors} as const
}
