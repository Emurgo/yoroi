// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  password: {
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  removeButton: {
    backgroundColor: COLORS.RED,
    margin: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
  wallet: {
    margin: 10,
  },
  error: {
    color: COLORS.RED,
  },
})

export default styles
