// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  item: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: 'rgba(150, 150, 255, 0.2)',
  },
  balance: {
    flexDirection: 'row',
  },
  icon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
    borderRadius: 8,
  },
  balanceText: {
    color: COLORS.WHITE,
    fontSize: 12,
  },
  nameText: {
    color: COLORS.WHITE,
    marginLeft: 10,
    fontSize: 18,
  },
})
