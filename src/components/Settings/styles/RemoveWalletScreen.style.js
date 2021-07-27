// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  descriptionContainer: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  walletInfo: {
    flex: 1,
  },
  walletNameLabel: {
    fontSize: 16,
  },
  walletName: {
    color: COLORS.DISABLED,
    fontSize: 16,
  },

  contentContainer: {
    paddingTop: 8,
    padding: 16,
    flexGrow: 1,
  },

  actions: {
    padding: 16,
  },
  removeButton: {
    backgroundColor: COLORS.RED,
    paddingTop: 10,
  },
})

export default styles
