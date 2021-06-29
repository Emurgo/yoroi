// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    elevation: 3,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  adaSignContainer: {
    marginTop: 6,
    marginLeft: 6,
  },
  last: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
  negativeAmount: {
    color: COLORS.BLACK,
  },
  neutralAmount: {
    color: COLORS.BLACK,
  },
  assuranceText: {
    fontSize: 12,
  },
  FAILED_CONTAINER: {
    backgroundColor: '#F8D7DA',
  },
  PENDING_CONTAINER: {
    backgroundColor: 'rgba(207, 217, 224, 0.6)',
  },
  iconContainer: {
    flex: 2,
  },
  txContainer: {
    flex: 14,
  },
})
