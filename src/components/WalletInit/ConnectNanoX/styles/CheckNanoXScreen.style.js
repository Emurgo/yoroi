// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  scrollView: {
    flex: 1,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
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
  linkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
    marginVertical: 16,
  },
})
