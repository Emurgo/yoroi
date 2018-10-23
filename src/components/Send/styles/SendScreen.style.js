// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  root: {
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
  inputText: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: COLORS.DARK_BLUE,
    margin: 10,
  },
  button: {
    margin: 10,
  },
  continueButton: {},
  continueButtonText: {},
}

export default styles
