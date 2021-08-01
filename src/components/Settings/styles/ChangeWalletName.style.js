// @flow

import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  scrollContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  action: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  spacer: {
    height: 16,
  },
})
