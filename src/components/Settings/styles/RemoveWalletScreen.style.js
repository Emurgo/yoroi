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
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  walletNameLabel: {
    fontSize: 16,
  },
  walletName: {
    color: COLORS.DISABLED,
    fontSize: 16,
  },

  contentContainer: {
    padding: 16,
  },

  actions: {
    padding: 16,
  },
  removeButton: {
    backgroundColor: COLORS.RED,
  },
})

export default styles
