// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
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
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
  },
  noAmount: {
    color: COLORS.BLACK,
  },
  adaSignContainer: {
    marginLeft: 5,
  },
  section: {
    marginTop: 10,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
})
