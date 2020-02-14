// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
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
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    color: COLORS.SHELLEY_BLUE,
    marginBottom: spacing.paragraphBottomMargin,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
  },
})
