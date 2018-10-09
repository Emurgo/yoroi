// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 10,
    paddingTop: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
  },
  adaSignContainer: {
    marginLeft: 5,
  },
}

export default styles
