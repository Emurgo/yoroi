import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {FlatList, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {ProviderItem} from '~/features/Exchange/common/ProviderItem/ProviderItem'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {BanxaLogo} from '../illustrations/BanxaLogo'
import {EncryptusLogo} from '../illustrations/EncryptusLogo'

export const SelectProviderFromListScreen = () => {
  const {palette: p} = useTheme()
  const {
    orderType,
    providerId: selectedProvider,
    orderTypeChanged,
    providerIdChanged,
    provider,
  } = useExchange()
  const providers = useExchangeProvidersByOrderType({
    orderType,
    providerListByOrderType: provider.list.byOrderType,
  })
  const strings = useStrings()

  const handleOnSelectProvider = React.useCallback(
    (providerId: string) => {
      if (orderType === 'buy') orderTypeChanged('sell')
      else if (orderType === 'sell') orderTypeChanged('buy')

      providerIdChanged(providerId)
    },
    [orderType, orderTypeChanged, providerIdChanged],
  )

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={a.flex_1}>
      <FlatList
        style={a.px_lg}
        data={providers}
        renderItem={({
          item: [providerId, provider],
        }: {
          item: [string, Exchange.Provider]
        }) => {
          const fee = provider.supportedOrders[orderType]?.fee ?? 0
          // TODO: update for the logo from the provider later
          const ProviderLogo =
            providerId === 'banxa' ? BanxaLogo : EncryptusLogo
          const rightAdornment = selectedProvider === providerId && (
            <View>
              <Icon.Check size={24} color={p.primary_600} />

              <Space.Height.sm fill />
            </View>
          )
          const leftAdornment = <ProviderLogo size={40} />
          return (
            <ProviderItem
              label={provider.name}
              fee={`${fee}% ${strings.fee}`}
              leftAdornment={leftAdornment}
              rightAdornment={rightAdornment}
              onPress={() => handleOnSelectProvider(providerId)}
            />
          )
        }}
        ItemSeparatorComponent={() => <Space.Height.lg />}
        keyExtractor={([providerId]) => providerId}
      />
    </SafeAreaView>
  )
}
