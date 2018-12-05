// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flex: 0,
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 10,
  },
  containerQR: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scanIcon: {
    flex: 0,
    width: 100,
    height: 100,
    backgroundColor: COLORS.DARK_BLUE,
  },
  label: {
    color: COLORS.DARK_BLUE,
  },
  inputContainer: {
    flex: 1,
  },
  button: {
    margin: 10,
  },
  continueButton: {},
  continueButtonText: {},
  error: {
    color: COLORS.RED,
    marginLeft: 10,
    marginRight: 10,
  },
})

export default styles
