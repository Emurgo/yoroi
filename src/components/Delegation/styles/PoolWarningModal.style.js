// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../styles/config'

export default StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  reputationInfoView: {
    marginBottom: spacing.paragraphBottomMargin,
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
