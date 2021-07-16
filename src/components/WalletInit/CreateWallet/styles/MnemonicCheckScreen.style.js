// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  content: {
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
  buttons: {
    flexDirection: 'row',
    padding: 16,
  },
  clearButton: {
    marginRight: 12,
  },
  confirmButton: {
    marginLeft: 12,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  error: {
    paddingLeft: 16,
  },
  errorMessage: {
    color: COLORS.RED,
  },
  inputLabel: {
    color: COLORS.PRIMARY,
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
    height: 26,
    lineHeight: 26,
    marginVertical: 6,
    marginHorizontal: 6,
  },
  wordBadge: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    height: 26,
    marginVertical: 6,
    marginHorizontal: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
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
