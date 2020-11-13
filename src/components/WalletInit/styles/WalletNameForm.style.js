// @flow
import {StyleSheet} from 'react-native'

import {spacing} from '../../../styles/config'

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
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    marginHorizontal: 10,
    marginVertical: 16,
  },
})
