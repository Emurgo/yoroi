// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  scrollView: {
    paddingRight: 10,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  label: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  leftButton: {
    marginRight: 16,
  },
})
