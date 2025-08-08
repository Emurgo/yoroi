import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

const YOROI_SUPPORT_URL = 'https://yoroi-wallet.com/#/support'

export const DescribeAction = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
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
      <Text style={[{fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'}]}>
        {strings.descriptionBuySellADATransaction}
      </Text>

      <Space.Height.lg />

      <View style={[a.flex_row, a.align_center, {flexWrap: 'wrap'}]}>
        <Text style={[{fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'}]}>
          {strings.contact}{' '}
        </Text>

        <TouchableOpacity onPress={handleOnContactProvider}>
          <Text
            style={[
              {fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'},
              {color: '#4B6DDE', textDecorationLine: 'underline'},
            ]}
          >
            {name}{' '}
          </Text>
        </TouchableOpacity>

        <Text style={[{fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'}]}>
          {strings.and}{' '}
        </Text>

        <TouchableOpacity onPress={handleOnContactYoroi}>
          <Text
            style={[
              {fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'},
              {color: '#4B6DDE', textDecorationLine: 'underline'},
            ]}
          >
            {strings.customerSupport}
          </Text>
        </TouchableOpacity>

        <Text style={[{fontSize: 16, lineHeight: 22, fontFamily: 'Rubik'}]}>
          {strings.significant}
        </Text>
      </View>
    </View>
  )
}
