// @flow

import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemBlock: {
    marginTop: 24,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#353535',
  },
  itemBody: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.SECONDARY_TEXT,
  },
  bottomBlock: {
    padding: 16,
    height: 88,
  },
  input: {
    marginTop: 16,
  },
  rewards: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 19,
    color: COLORS.SHELLEY_BLUE,
    fontWeight: '500',
  },
  fees: {
    textAlign: 'right',
    color: '#353535',
  },
})
