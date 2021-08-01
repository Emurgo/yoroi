// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
  },
  scrollView: {},
  contentContainer: {
    paddingHorizontal: 16,
  },
  plateContainer: {
    minHeight: 72,
  },
  checksumLabel: {
    fontSize: 14,
    paddingVertical: 24,
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
  addresses: {},
  addressesLabel: {
    color: COLORS.DARK_TEXT,
  },
  checksum: {
    fontWeight: 'bold',
  },
  action: {
    padding: 16,
  },

  plate: {
    flexDirection: 'row',
    alignItems: 'center',
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
