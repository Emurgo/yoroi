// @flow
import {StyleSheet} from 'react-native'

import {screenPadding} from '../../../Screen'

export default StyleSheet.create({
  screen: {
    padding: 0,
  },
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  mnemonicNoteContainer: {
    padding: screenPadding,
  },
  mnemonicWordsContainer: {
    backgroundColor: '#fff',
    borderColor: '#9B9B9B',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mnemonicText: {
    lineHeight: 30,
    marginRight: 24,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  image: {
    alignItems: 'center',
    marginBottom: 24,
  },
})
