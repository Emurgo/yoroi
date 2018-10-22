// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 15,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DARK_GRAY,
  },
  label: {
    color: COLORS.DARK_BLUE,
  },
  clickableLabel: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
  address: {
    fontSize: 17,
  },
}

export default styles
