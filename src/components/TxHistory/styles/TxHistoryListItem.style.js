// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 10,
    paddingTop: 10,
  },
  metadataPanel: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 10,
    width: 120,
  },
  amountPanel: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 10,
  },
  horizontalSpacer: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
  },
  feeContainer: {
    flexDirection: 'row',
  },
  adaSignContainer: {
    marginTop: 6,
    marginLeft: 6,
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
  },
  neutralAmount: {
    color: COLORS.BLACK,
  },
  feeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontSize: 14,
  },
  integerAmount: {
    fontSize: 20,
  },
  decimalAmount: {
    paddingTop: 5,
    fontSize: 15,
  },
}

export default styles
