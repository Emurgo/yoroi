// @flow

import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  action: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
})
