// @flow
import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  removeButton: {
    backgroundColor: COLORS.RED,
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: COLORS.WARNING,
    color: COLORS.WARNING_TEXT_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  error: {
    color: COLORS.RED,
  },
  walletName: {
    color: COLORS.DISABLED,
    fontSize: 16,
    marginBottom: 7,
  },
  walletNameLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  walletInfo: {
    flex: 1,
  },
  screenContainer: {
    padding: 16,
    flexGrow: 1,
  },
})

export default styles
