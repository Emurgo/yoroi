// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    elevation: 1,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 70,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  adaSignContainer: {
    marginTop: 6,
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
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
  assurance: {
    width: 70,
    height: 21,
    borderRadius: 8,
  },
  assuranceText: {
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'center',
    color: '#fff',
  },
  HIGH: {
    backgroundColor: 'rgba(21, 209, 170, 0.8)',
  },
  MEDIUM: {
    backgroundColor: '#FED8B1',
  },
  LOW: {
    backgroundColor: '#F2C2D1',
  },
  PENDING: {
    backgroundColor: '#757476',
  },
  FAILED: {
    backgroundColor: '#DA6464',
  },
  FAILED_CONTAINER: {
    backgroundColor: '#F8D7DA',
  },
  PENDING_CONTAINER: {
    backgroundColor: 'rgba(207, 217, 224, 0.6)',
  },
})
