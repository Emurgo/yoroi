// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  checkbox: {
    paddingLeft: 4,
  },
  actions: {},
  primaryButton: {},
  secondaryButton: {
    backgroundColor: COLORS.BACKGROUND_RED,
  },
})

export const alertStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 16,
  },
  title: {
    color: COLORS.ALERT_TEXT_COLOR,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  headingText: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  image: {},
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  text: {
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
})
