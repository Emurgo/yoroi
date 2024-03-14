import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useExchange} from '../../common/ExchangeProvider'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {useProviders} from '../../common/useProviders'

export const SelectProvider = () => {
  const styles = useStyles()
  const {orderType, provider: selectedProvider, orderTypeChanged, providerChanged} = useExchange()

  const providers = useProviders()

  const onPress = React.useCallback(
    (provider: Exchange.Provider, features: Exchange.ProviderFeatures) => {
      if (orderType === 'buy' && !features.buy) orderTypeChanged('sell')
      else if (orderType === 'sell' && !features.sell) orderTypeChanged('buy')

      providerChanged(provider)
    },
    [orderType, orderTypeChanged, providerChanged],
  )

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <FlatList
        style={styles.list}
        data={providers}
        renderItem={({item: [provider, features]}) => {
          return (
            <ProviderItem
              provider={provider}
              fee={orderType === 'buy' ? features.buy?.fee ?? 0 : features.sell?.fee ?? 0}
              icon={selectedProvider === provider && <Check />}
              onPress={() => onPress(provider, features)}
            />
          )
        }}
        ItemSeparatorComponent={() => <Space height="l" />}
        keyExtractor={([provider]) => provider}
      ></FlatList>
    </SafeAreaView>
  )
}

const Check = () => {
  const {theme} = useTheme()
  return (
    <View>
      <Icon.Check size={24} color={theme.color.primary[600]} />

      <Space fill />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    list: {
      ...theme.padding['x-l'],
    },
  })

  return styles
}
