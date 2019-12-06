// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 24,
  },
  item: {
    marginBottom: 5,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})
