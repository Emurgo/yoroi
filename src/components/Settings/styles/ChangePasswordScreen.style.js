// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  action: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
})
