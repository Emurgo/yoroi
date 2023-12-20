import {banxaSupportUrl} from '@yoroi/banxa'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer, Text} from '../../../components'
import {useStrings} from './strings'

const BANXA_SUPPORT_URL = banxaSupportUrl
const YOROI_SUPPORT_URL = 'https://yoroi-wallet.com/#/support'

const DescribeAction = () => {
  const strings = useStrings()

  const handleLinkingContactBanxa = () => {
    Linking.openURL(BANXA_SUPPORT_URL)
  }

  const handleLinkingContactYoroi = () => {
    Linking.openURL(YOROI_SUPPORT_URL)
  }

  return (
    <View style={styles.modalContent}>
      <Text style={styles.description}>{strings.descriptionBuySellADATransaction}</Text>

      <Spacer height={24} />

      <View style={[styles.decorationText]}>
        <Text style={[styles.description]}>{strings.contact} </Text>

        <TouchableOpacity onPress={handleLinkingContactBanxa}>
          <Text style={[styles.description, styles.linkText]}>{strings.banxa} </Text>
        </TouchableOpacity>

        <Text style={styles.description}>{strings.and} </Text>

        <TouchableOpacity onPress={handleLinkingContactYoroi}>
          <Text style={[styles.description, styles.linkText]}>{strings.customerSupport}</Text>
        </TouchableOpacity>

        <Text style={styles.description}>{strings.significant}</Text>
      </View>
    </View>
  )
}

export default DescribeAction

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
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
