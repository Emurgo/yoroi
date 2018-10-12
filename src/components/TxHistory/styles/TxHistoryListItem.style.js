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
    marginLeft: 10,
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    fontSize: 20,
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontSize: 20,
  },
  neutralAmount: {
    color: COLORS.BLACK,
    fontSize: 20,
  },
  feeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontSize: 14,
  },
}

export default styles
