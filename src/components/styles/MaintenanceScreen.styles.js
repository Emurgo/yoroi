// @flow

import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../styles/config'

export default StyleSheet.create({
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    backgroundColor: COLORS.ERROR_TEXT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  titleText: {
    color: COLORS.WHITE,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  image: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  attention: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  button: {
    margin: 24,
  },
})
