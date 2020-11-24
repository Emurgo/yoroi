// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  checkSumView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
    borderColor: 'red',
  },
  checksumText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  addressesContainer: {
    marginBottom: 32,
  },
})
