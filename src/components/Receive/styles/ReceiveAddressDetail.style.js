// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  qrcode: {
    backgroundColor: COLORS.DARK_BLUE,
    foregroundColor: COLORS.WHITE,
  },
  addressLabel: {
    color: COLORS.DARK_BLUE,
  },
  address: {
    fontSize: 17,
  },
}

export default styles
