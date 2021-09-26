// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  checksumLabel: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  instructionsLabel: {
    lineHeight: 32,
    color: COLORS.DARK_TEXT,
  },
  bulletPoint: {
    lineHeight: 24,
    color: COLORS.DARK_TEXT,
  },
  addressesLabel: {
    color: COLORS.DARK_TEXT,
  },
  checksum: {
    fontWeight: 'bold',
  },

  plate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    padding: 16,
  },

  addressRowStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 22,
    height: 22,
  },
  notifView: {
    paddingLeft: 4,
  },
  addressHash: {
    width: 280,
    color: '#9B9B9B',
    lineHeight: 30,
  },
})
