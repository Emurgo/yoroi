// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../../styles/config'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#163fa0',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  scrollView: {
    paddingRight: 10,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
})
