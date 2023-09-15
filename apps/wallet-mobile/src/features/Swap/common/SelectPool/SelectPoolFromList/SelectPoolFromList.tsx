import {useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../../components'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {COLORS} from '../../../../../theme'
import {useNavigateTo} from '../../navigation'
import {PoolIcon} from '../../PoolIcon/PoolIcon'
import {useStrings} from '../../strings'
import {useSwapTouched} from '../../SwapFormProvider'

type Props = {
  data?: Swap.PoolPair[]
}
export const SelectPoolFromList = ({data = []}: Props) => {
  const strings = useStrings()
  const {selectedPoolChanged, createOrder} = useSwap()
  const {poolTouched} = useSwapTouched()
  const [selectedCardIndex, setSelectedCardIndex] = useState(createOrder.selectedPool?.poolId)
  const navigate = useNavigateTo()
  const {track} = useMetrics()

  const handleCardSelect = (pool: Swap.PoolPair) => {
    track.swapPoolChanged()
    selectedPoolChanged(pool)
    setSelectedCardIndex(pool.poolId)
    poolTouched()
    navigate.startSwap()
  }

  const protocolCapitalize = (protocol: string): string => protocol[0].toUpperCase() + protocol.substring(1)

  return (
    <View style={styles.container}>
      {data.map((pool) => (
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

                    <View style={styles.info}>
                      <Text style={styles.infoLabel}>{strings.price}</Text>

                      <Text style={styles.infoValue}>{pool.price} ADA</Text>
                    </View>
                  </View>

                  <View>
                    <Spacer height={8} />

                    <View style={styles.info}>
                      <Text style={styles.infoLabel}>{strings.tvl}, ADA</Text>

                      <Text style={styles.infoValue}>{pool.deposit.quantity}</Text>
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
                      <Text style={styles.infoLabel}>{strings.batcherFee}, ADA</Text>

                      <Text style={styles.infoValue}>{pool.batcherFee.quantity}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      ))}
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
