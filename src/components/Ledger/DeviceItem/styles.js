// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export const styles = StyleSheet.create({
  deviceItem: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: COLORS.LIGHT_POSITIVE_GREEN,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
})
