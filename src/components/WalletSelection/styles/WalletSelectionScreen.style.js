// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    paddingVertical: 16,
  },
  wallets: {
    margin: 16,
    flex: 1,
  },
  addWalletButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  balanceCheckButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
})
