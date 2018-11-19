// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  header: {
    alignItems: 'flex-end',
  },
  close: {
    fontSize: 25,
    padding: 10,
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 10,
  },
  container: {
    padding: 10,
  },
  qrcode: {
    backgroundColor: COLORS.DARK_BLUE,
    foregroundColor: COLORS.WHITE,
    size: 200,
  },
  address: {
    fontSize: 17,
  },
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendButton: {
    textAlign: 'center',
    padding: 5,
  },
}

export default styles
