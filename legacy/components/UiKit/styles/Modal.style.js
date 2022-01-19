// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(74,74,74,.9)',
  },
  noPadding: {
    padding: 0,
    marginTop: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 24,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  content: {
    marginTop: 15,
  },
  withTitle: {
    paddingTop: 0,
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    lineHeight: 30,
    color: COLORS.MODAL_HEADING,
    alignSelf: 'center',
    paddingTop: 8,
  },
})

export default styles
