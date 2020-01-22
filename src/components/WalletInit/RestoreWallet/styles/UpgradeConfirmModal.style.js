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
    fontSize: 14,
    lineHeight: 22,
  },
  heading: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  item: {
    marginBottom: 5,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    lineHeight: 24,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  leftButton: {
    marginRight: 6,
  },
  rightButton: {
    marginLeft: 6,
  },
})
