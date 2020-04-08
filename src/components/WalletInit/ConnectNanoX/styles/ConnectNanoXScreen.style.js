// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  caption: {
    marginTop: 12,
  },
  flatList: {
    flex: 1,
  },
  paragraph: {
    marginVertical: 24,
    fontSize: 14,
    lineHeight: 22,
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
  },
  item: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
  },
})
