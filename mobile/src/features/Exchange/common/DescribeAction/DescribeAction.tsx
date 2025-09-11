import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

const YOROI_SUPPORT_URL = 'https://yoroi-wallet.com/#/support'

export const DescribeAction = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {orderType, providerId, provider} = useExchange()
  const providers = useExchangeProvidersByOrderType({
    orderType,
    providerListByOrderType: provider.list.byOrderType,
  })
  const providerSelected = Object.fromEntries(providers)[providerId]
  const name = providerSelected?.name ?? ''

  const handleOnContactProvider = () => {
    if (providerSelected?.supportUrl != null)
      Linking.openURL(providerSelected.supportUrl)
  }

  const handleOnContactYoroi = () => {
    Linking.openURL(YOROI_SUPPORT_URL)
  }

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Text style={a.body_1_lg_regular}>
        {strings.exchange.descriptionBuySellADATransaction}
      </Text>

      <Space.Height.lg />

      <View style={[a.flex_row, a.align_center, a.flex_wrap]}>
        <Text style={a.body_1_lg_regular}>{strings.exchange.contact} </Text>

        <TouchableOpacity onPress={handleOnContactProvider}>
          <Text style={[a.link_1_lg_underline, ta.text_primary_max]}>
            {name}{' '}
          </Text>
        </TouchableOpacity>

        <Text style={a.body_1_lg_regular}>{strings.exchange.and} </Text>

        <TouchableOpacity onPress={handleOnContactYoroi}>
          <Text style={[a.link_1_lg_underline, ta.text_primary_max]}>
            {strings.exchange.customerSupport}
          </Text>
        </TouchableOpacity>

        <Text style={a.body_1_lg_regular}>{strings.exchange.significant}</Text>
      </View>
    </View>
  )
}
