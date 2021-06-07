// @flow
import {StyleSheet} from 'react-native'

import {theme} from '../../../styles/config'
import common from './common.style'

export default StyleSheet.create({
  ...common,
  note: {
    color: '#242838',
    fontWeight: 'bold',
  },
  qrCode: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrCodeBackground: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F0F3F5',
  },
  secretCode: {
    backgroundColor: '#F0F3F5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
  copyButton: {
    padding: 16,
    paddingRight: 0,
    justifyContent: 'center',
  },
  key: {
    flex: 1,
  },
  alertBlock: {
    padding: 16,
    backgroundColor: theme.COLORS.backgroundAlert,
    borderRadius: 8,
  },
})
