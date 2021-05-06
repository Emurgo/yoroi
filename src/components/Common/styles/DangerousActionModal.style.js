// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: spacing.paragraphBottomMargin,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  alertBlock: {
    marginTop: 32,
    padding: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    borderRadius: 8,
  },
  alertTitleText: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  image: {
    marginRight: 5,
  },
  alertText: {
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  checkbox: {
    marginTop: 24,
  },
  buttons: {
    flexDirection: 'column',
    marginTop: 32,
  },
  primaryButton: {},
  secondaryButton: {
    marginTop: 16,
    backgroundColor: COLORS.BACKGROUND_RED,
  },
})
