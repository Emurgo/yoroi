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
  descriptionContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingVertical: 17,
    paddingHorizontal: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
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
    marginTop: 5,
    padding: 16,
    flexGrow: 1,
  },
  actions: {
    padding: 16,
  },
})

export default styles
