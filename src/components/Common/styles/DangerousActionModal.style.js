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
    flexDirection: 'row',
    marginBottom: spacing.paragraphBottomMargin,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  alertBlock: {
    padding: 10,
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    marginBottom: 5,
  },
  image: {
    marginRight: 5,
  },
  alertText: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primaryButton: {},
  secondaryButton: {
    marginLeft: 12,
    backgroundColor: COLORS.BACKGROUND_RED,
  },
})
