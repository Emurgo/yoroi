// @flow

import {StyleSheet} from 'react-native'

import {spacing} from '../../../styles/config'

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
  image: {
    marginRight: 5,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primaryButton: {},
  secondaryButton: {
    marginRight: 12,
  },
})
