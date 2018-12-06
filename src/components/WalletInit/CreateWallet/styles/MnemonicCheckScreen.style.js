// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  buttons: {
    flexDirection: 'row',
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
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingBottom: 0,
    marginTop: 16,
    // minHeight: 26 * 3 + 12 * 2,
    // flexShrink: 1,
    // flexGrow: 0,
  },
  word: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    height: 26,
    marginBottom: 12,
    marginRight: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    // paddingVertical: 8,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    flex: 1,
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
