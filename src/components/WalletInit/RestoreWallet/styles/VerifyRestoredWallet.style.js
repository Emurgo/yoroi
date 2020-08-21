// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  textStyles: {
    fontSize: 14,
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
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
  },
  titleStyles: {
    marginBottom: 8,
  },
  instructionStyles: {
    lineHeight: 27,
  },
  addressesStyles: {
    marginTop: 32,
    marginBottom: 32,
  },
  addressRowStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  copyIcon: {
    marginLeft: 4,
  },

  addressHash: {
    width: 300,
    color: '#9B9B9B',
    lineHeight: 30,
  },
  walletIcon: {
    width: 60,
    height: 60,
  },
})
