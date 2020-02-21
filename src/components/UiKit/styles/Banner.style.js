// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BANNER_GREY,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textError: {
    color: '#FF1351',
  },
  bannerError: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  label: {
    marginBottom: 6,
  },
})

export default styles
