import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {ProviderItem} from '../../common/ProviderItem/ProviderItem'
import {BanxaLogo} from '../../illustrations/BanxaLogo'
import {EncryptusLogo} from '../../illustrations/EncryptusLogo'

export const SelectProviderFromListScreen = () => {
  const styles = useStyles()
  const {orderType, providerId: selectedProvider, orderTypeChanged, providerIdChanged, provider} = useExchange()
  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})

  const handleOnSelectProvider = React.useCallback(
    (providerId: string) => {
      if (orderType === 'buy') orderTypeChanged('sell')
      else if (orderType === 'sell') orderTypeChanged('buy')

      providerIdChanged(providerId)
    },
    [orderType, orderTypeChanged, providerIdChanged],
  )

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <FlatList
        style={styles.list}
        data={providers}
        renderItem={({item: [providerId, provider]}: {item: [string, Exchange.Provider]}) => {
          const fee = provider.supportedOrders[orderType]?.fee ?? 0
          // TODO: update for the logo from the provider later
          const ProviderLogo = providerId === 'banxa' ? BanxaLogo : EncryptusLogo
          const rightAdornment = selectedProvider === providerId && <CheckIcon />
          const leftAdornment = <ProviderLogo size={40} />
          return (
            <ProviderItem
              label={provider.name}
              fee={fee}
              leftAdornment={leftAdornment}
              rightAdornment={rightAdornment}
              onPress={() => handleOnSelectProvider(providerId)}
            />
          )
        }}
        ItemSeparatorComponent={() => <Space height="l" />}
        keyExtractor={([providerId]) => providerId}
      ></FlatList>
    </SafeAreaView>
  )
}

const CheckIcon = () => {
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
