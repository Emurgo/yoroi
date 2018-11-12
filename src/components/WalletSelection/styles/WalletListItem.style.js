// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  item: {
    borderBottomColor: COLORS.PRIMARY_GRADIENT_END,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    padding: 10,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balance: {
    flexDirection: 'row',
  },
  balanceText: {
    color: COLORS.WHITE,
    fontSize: 12,
  },
  name: {
    flexDirection: 'row',
  },
  nameText: {
    color: COLORS.WHITE,
    fontSize: 18,
  },
}

export default styles
