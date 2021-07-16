// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    alignItems: 'center',
  },
  createButton: {
    marginBottom: 10,
  },
  mnemonicDialogButton: {
    marginTop: 15,
  },
  emurgoCreditsContainer: {
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
})
