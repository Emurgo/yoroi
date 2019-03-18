// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
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
    color: COLORS.RED,
    paddingLeft: 16,
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
    marginTop: 16,
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
    marginTop: 12,
    marginBottom: 12,
    height: 26 * 7,
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
