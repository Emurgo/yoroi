import {useSwap} from '@yoroi/swap'
import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Boundary, Spacer} from '../../../../../components'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../navigation'
import {PoolIcon} from '../../PoolIcon/PoolIcon'
import {useStrings} from '../../strings'
import {useSwapTouched} from '../../SwapFormProvider'

type Props = {
  pools?: ReadonlyArray<Swap.Pool>
}
export const SelectPoolFromList = ({pools = []}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {selectedPoolChanged, orderData} = useSwap()
  const {poolTouched} = useSwapTouched()
  const [selectedCardIndex, setSelectedCardIndex] = useState(orderData.selectedPoolId)
  const navigate = useNavigateTo()
  const {track} = useMetrics()

  const handleCardSelect = (pool: Swap.Pool) => {
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
        const formattedDepositInPt = `${Quantities.format(pool.deposit.quantity, decimals, decimals)} ${ticker}`
        const formattedBatcherFeeInPt = `${Quantities.format(pool.batcherFee.quantity, decimals, decimals)} ${ticker}`

        return (
          <View key={pool.poolId}>
            <Spacer height={16} />

            <View style={[styles.shadowProp]}>
              <LinearGradient
                colors={pool.poolId === selectedCardIndex ? ['#E4E8F7', '#C6F7F7'] : [COLORS.WHITE, COLORS.WHITE]}
                style={styles.linearGradient}
              >
                <TouchableOpacity key={pool.poolId} onPress={() => handleCardSelect(pool)} style={[styles.card]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.icon}>
                      <PoolIcon size={40} providerId={pool.provider} />
                    </View>

                    <Text style={styles.label}>{protocolCapitalize(pool.provider)}</Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <View>
                      <Spacer height={8} />

                      <Boundary>
                        <PriceInAda pool={pool} wallet={wallet} sell={orderData.amounts.sell} />
                      </Boundary>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{`${strings.tvl}, ${wallet.primaryTokenInfo.ticker}`}</Text>

                        <Text style={styles.infoValue}>{formattedDepositInPt}</Text>
                      </View>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.poolFee}, %</Text>

                        <Text style={styles.infoValue}>{pool.fee}%</Text>
                      </View>
                    </View>

                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text
                          style={styles.infoLabel}
                        >{`${strings.batcherFee}, ${wallet.primaryTokenInfo.ticker}`}</Text>

                        <Text style={styles.infoValue}>{formattedBatcherFeeInPt}</Text>
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

type PriceInAdaProps = {pool: Swap.Pool; wallet: YoroiWallet; sell: Balance.Amount}
const PriceInAda = ({pool, wallet, sell}: PriceInAdaProps) => {
  const strings = useStrings()
  
  const {decimals: decimalsA = 0}= useTokenInfo({wallet, tokenId: pool.tokenA.tokenId})
  const {decimals: decimalsB = 0}= useTokenInfo({wallet, tokenId: pool.tokenB.tokenId})

  const scaleA = new BigNumber(10).pow(decimalsA)
  const scaleB = new BigNumber(10).pow(decimalsB)
  
  const isSellTokenA = pool.tokenA.tokenId === sell.tokenId
  const [dividend, divisor] = isSellTokenA
    ? [new BigNumber(pool.ptPriceTokenB).multipliedBy(scaleB), new BigNumber(pool.ptPriceTokenA).multipliedBy(scaleA)]
    : [new BigNumber(pool.ptPriceTokenA).multipliedBy(scaleA), new BigNumber(pool.ptPriceTokenB).multipliedBy(scaleB)]
  // limit decimals
  const ptPrice = divisor.isZero() ? '0' : dividend.dividedBy(divisor).toFixed(Math.max(decimalsA, decimalsB), BigNumber.ROUND_DOWN)
  // const price = parsedPrice != null ? asQuantity(parsedPrice) : Quantities.zero
  // const formattedPriceInPt = `${Quantities.format(price, 0, decimals)} ${ticker}`
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{strings.price}</Text>

      <Text style={styles.infoValue}>{ptPrice}</Text>
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
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
  },
  infoValue: {},
})
