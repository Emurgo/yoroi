// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  instructions: {
    paddingBottom: 16,
  },
  recoveryPhrase: {
    borderRadius: 8,
    borderColor: '#4A4A4A',
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 0,
    height: 26 * 6,
    paddingHorizontal: 6,
  },
  recoveryPhraseError: {
    borderColor: COLORS.RED,
  },
  wordText: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  error: {
    paddingLeft: 16,
  },
  errorMessage: {
    color: COLORS.RED,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
  },
  clearButton: {
    paddingRight: 12,
  },
  confirmButton: {
    paddingLeft: 12,
  },
  wordBadgeContainer: {
    padding: 4,
  },
  wordBadge: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  selected: {
    opacity: 0,
  },
  selectedText: {
    opacity: 0.4,
  },
  hidden: {
    opacity: 0,
  },
})
