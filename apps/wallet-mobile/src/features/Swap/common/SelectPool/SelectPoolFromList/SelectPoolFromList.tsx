import {usePortfolioTokenInfo} from '@yoroi/portfolio'
import {getMarketPrice, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../../components'
import {Space} from '../../../../../components/Space/Space'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
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
  const {wallet} = useSelectedWallet()
  const {selectedPoolChanged, orderData} = useSwap()
  const {poolTouched} = useSwapForm()
  const [selectedCardIndex, setSelectedCardIndex] = useState(orderData.selectedPoolId)
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {styles, colors} = useStyles()
  const {isDark} = useTheme()

  const {tokenInfo: sellTokenInfo} = usePortfolioTokenInfo(
    {
      getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
      id: orderData.amounts.sell?.info.id ?? 'unknown.',
      network: wallet.networkManager.network,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    },
    {suspense: true},
  )
  const {tokenInfo: buyTokenInfo} = usePortfolioTokenInfo(
    {
      getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
      id: orderData.amounts.buy?.info.id ?? 'unknown.',
      network: wallet.networkManager.network,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    },
    {suspense: true},
  )

  // NOTE: suspense + default to unknown
  if (!sellTokenInfo || !buyTokenInfo) return null

  const denomination = sellTokenInfo.decimals - buyTokenInfo.decimals
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
          new BigNumber(pool.tokenA.quantity.toString())
            .dividedBy(new BigNumber(pool.ptPriceTokenA))
            .multipliedBy(2)
            .toString(),
        )
        const formattedTvl = Quantities.format(tvl, decimals, 0)
        const formattedBatcherFeeInPt = Quantities.format(
          asQuantity(pool.batcherFee.quantity.toString()),
          decimals,
          decimals,
        )
        const marketPrice =
          orderData.amounts.sell?.info.id != null
            ? getMarketPrice(pool, orderData.amounts.sell.info.id)
            : new BigNumber(0)
        const selectedPoolId = selectedCardIndex ?? orderData?.bestPoolCalculation?.pool?.poolId ?? null
        const isSelectedPool = pool.poolId === selectedPoolId

        return (
          <View key={pool.poolId}>
            <Spacer height={16} />

            <View style={[isSelectedPool && isDark ? undefined : styles.shadowProp]}>
              <LinearGradient
                colors={isSelectedPool ? colors.gradientColor : [colors.white, colors.white]}
                style={styles.linearGradient}
              >
                <TouchableOpacity
                  key={pool.poolId}
                  onPress={() => handleOnPoolSelection(pool)}
                  style={[styles.card, !isSelectedPool && {backgroundColor: colors.bg}]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.icon}>
                      <PoolIcon size={40} providerId={pool.provider} />
                    </View>

                    <Space width="md" />

                    <Text style={styles.label}>{protocolCapitalize(pool.provider)}</Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <View>
                      <Spacer height={8} />

                      <View style={styles.info}>
                        <Text style={styles.infoLabel}>{strings.marketPrice}</Text>

                        <Text style={styles.infoValue}>
                          {`${Quantities.format(
                            asQuantity(marketPrice),
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
      flex: 1,
      paddingBottom: 30,
    },
    linearGradient: {
      flex: 1,
      opacity: 1,
      borderRadius: 8,
    },
    card: {
      ...atoms.p_lg,
      borderRadius: 8,
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
      borderRadius: 8,
      width: 40,
      overflow: 'hidden',
    },
    label: {
      color: color.text_gray_normal,
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
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    infoValue: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
      display: 'flex',
      flexShrink: 1,
      textAlign: 'right',
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
    white: color.gray_cmin,
    bg: color.bg_color_high,
  }

  return {styles, colors} as const
}
