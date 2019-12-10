// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  leftButton: {
    marginRight: 12,
  },
})
