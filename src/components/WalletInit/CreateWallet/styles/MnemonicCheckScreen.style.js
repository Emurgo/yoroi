// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  instructions: {
    paddingHorizontal: 16,
  },
  recoveryPhrase: {
    height: 26 * 6,
    paddingHorizontal: 16,
  },
  recoveryPhraseOutline: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.DARK_GRAY,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  recoveryPhraseError: {
    borderColor: COLORS.RED,
  },
  error: {
    paddingHorizontal: 16,
  },
  errorMessage: {
    color: COLORS.ERROR_TEXT_COLOR,
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
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  wordBadgeText: {
    color: COLORS.WORD_BADGE_TEXT,
  },
  selected: {
    opacity: 0.5,
  },
  hidden: {
    opacity: 0,
  },
})
