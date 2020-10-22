// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  item: {
    marginBottom: 5,
  },
  input: {
    marginTop: 16,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    lineHeight: 24,
    fontSize: 16,
  },
})
