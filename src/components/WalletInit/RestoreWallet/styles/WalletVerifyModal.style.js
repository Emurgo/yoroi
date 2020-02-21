// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../../styles/config'

export default StyleSheet.create({
  content: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  label: {
    marginTop: 5,
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
  },
})
