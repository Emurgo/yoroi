// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  container: {
    flexShrink: 1,
    padding: 5,
    backgroundColor: COLORS.WHITE,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontSize: 20,
  },
  noAmount: {
    color: COLORS.BLACK,
    fontSize: 20,
  },
  adaSignContainer: {
    marginLeft: 5,
  },
  label: {
    fontSize: 17,
  },
  section: {
    marginTop: 10,
  },
}

export default styles
