// @flow
import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
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
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  alertBlock: {
    padding: 10,
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
  },
  alertText: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  button: {
    marginHorizontal: 10,
    marginBottom: spacing.paragraphBottomMargin,
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
    backgroundColor: COLORS.BACKGROUND_RED,
  },
})
