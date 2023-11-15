import {getMarketPrice, useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../../components'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
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
                colors={pool.poolId === selectedPoolId ? ['#E4E8F7', '#C6F7F7'] : [COLORS.WHITE, COLORS.WHITE]}
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingBottom: 30,
  },
  linearGradient: {
    height: 200,
    borderRadius: 8,
  },
  card: {
    height: 200,
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  shadowProp: {
    shadowColor: '#000',
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
    fontWeight: '500',
    fontSize: '16',
  },
  icon: {
    marginRight: 8,
    fontSize: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#6B7384',
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Rubik-Regular',
  },
})
