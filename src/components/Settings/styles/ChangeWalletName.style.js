// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  action: {
    backgroundColor: COLORS.BACKGROUND,
    marginBottom: 16,
  },
})
