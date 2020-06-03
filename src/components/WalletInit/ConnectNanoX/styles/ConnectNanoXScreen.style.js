// @flow
import {StyleSheet} from 'react-native'

import {COLORS, spacing} from '../../../../styles/config'

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
  scrollView: {
    flex: 1,
    marginBottom: 22,
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
    flexDirection: 'column',
    minHeight: 148,
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
  listHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  error: {
    color: COLORS.ERROR_TEXT_COLOR,
  },
  instructionsBlock: {
    marginVertical: 24,
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
  button: {
    marginHorizontal: 10,
    marginBottom: 8,
  },
})
