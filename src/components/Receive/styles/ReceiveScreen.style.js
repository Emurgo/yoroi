// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
  },
  address: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  lists: {
    flex: 1,
  },
  addressListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  heading: {
    fontWeight: 'bold',
  },
})
