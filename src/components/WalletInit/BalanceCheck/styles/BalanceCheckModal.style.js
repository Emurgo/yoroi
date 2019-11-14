// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  heading: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 24,
  },
  content: {
    marginBottom: 24,
  },
  item: {
    marginBottom: 20,
  },
  addressList: {
    flexDirection: 'row',
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})
