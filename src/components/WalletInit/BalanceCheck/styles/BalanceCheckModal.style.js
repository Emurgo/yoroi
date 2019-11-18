// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  heading: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 24,
  },
  content: {
    marginBottom: 24,
  },
  item: {
    marginBottom: 5,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
  empty: {
    lineHeight: 20,
    alignItems: 'center',
    flex: 1,
    marginBottom: 24,
  },
})
