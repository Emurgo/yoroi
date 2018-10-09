// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  navigationButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.DARK_GRAY,
    padding: 1,
  },
  button: {
    flex: 1,
    height: 40,
  },
  sendButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiveButton: {
    flex: 1,
    backgroundColor: COLORS.DARK_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiveButtonText: {
    color: COLORS.WHITE,
  },
}

export default styles
