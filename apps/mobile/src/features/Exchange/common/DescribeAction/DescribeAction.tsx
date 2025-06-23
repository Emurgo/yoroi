import {useExchange, useExchangeProvidersByOrderType} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useStrings} from '../useStrings'

const YOROI_SUPPORT_URL = 'https://yoroi-wallet.com/#/support'

export const DescribeAction = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {orderType, providerId, provider} = useExchange()
  const providers = useExchangeProvidersByOrderType({orderType, providerListByOrderType: provider.list.byOrderType})
  const providerSelected = Object.fromEntries(providers)[providerId]
  const name = providerSelected?.name ?? ''

  const handleOnContactProvider = () => {
    if (providerSelected?.supportUrl != null) Linking.openURL(providerSelected.supportUrl)
  }

  const handleOnContactYoroi = () => {
    Linking.openURL(YOROI_SUPPORT_URL)
  }

  return (
    <View style={styles.modalContent}>
      <Text style={styles.description}>{strings.descriptionBuySellADATransaction}</Text>

      <Spacer height={24} />

      <View style={[styles.decorationText]}>
        <Text style={[styles.description]}>{strings.contact} </Text>

        <TouchableOpacity onPress={handleOnContactProvider}>
          <Text style={[styles.description, styles.linkText]}>{name} </Text>
        </TouchableOpacity>

        <Text style={styles.description}>{strings.and} </Text>

        <TouchableOpacity onPress={handleOnContactYoroi}>
          <Text style={[styles.description, styles.linkText]}>{strings.customerSupport}</Text>
        </TouchableOpacity>

        <Text style={styles.description}>{strings.significant}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    modalContent: {
      flex: 1,
      ...atoms.px_lg,
    },
    description: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'Rubik',
    },
    decorationText: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    linkText: {
      color: '#4B6DDE',
      textDecorationLine: 'underline',
    },
  })
  return styles
}
