// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 20,
  },
  warning: {
    color: COLORS.RED,
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 20,
  },
  disableSection: {
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
})

export default styles
