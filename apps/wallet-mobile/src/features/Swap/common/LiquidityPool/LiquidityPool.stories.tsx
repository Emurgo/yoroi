import {storiesOf} from '@storybook/react-native'
import {getPoolUrlByProvider} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {PoolIcon} from '../PoolIcon/PoolIcon'
import {LiquidityPool} from './LiquidityPool'

const supportedProviders: ReadonlyArray<Swap.SupportedProvider> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'vyfi',
  'muesliswap_v2',
] as const

const LiquidityDexList = () => {
  return (
    <View>
      {supportedProviders.map((provider) => (
        <LiquidityDex key={provider} provider={provider} />
      ))}
    </View>
  )
}

const LiquidityDex = ({provider}) => {
  const poolIcon = <PoolIcon providerId={provider} size={18} />
  const poolUrl = getPoolUrlByProvider(provider)
  const poolProviderFormatted = capitalize(provider)

  return <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />
}

storiesOf('LiquidityPool', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <LiquidityDexList />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
