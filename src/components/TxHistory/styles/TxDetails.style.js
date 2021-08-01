// @flow

import {StyleSheet} from 'react-native'

import stylesConfig, {COLORS} from '../../../styles/config'

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
    fontWeight: '500',
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontWeight: '500',
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
  assetsExpandable: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  assetsTitle: {
    fontSize: 14,
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.TEXT_GRAY,
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: 'rgba(173, 174, 182, 0.3)',
  },
})
