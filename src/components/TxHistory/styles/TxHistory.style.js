// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: '50%',
  },
  emptyText: {
    color: '#9B9B9B',
    marginTop: 32,
  },
  warningNoteStyles: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
  },
})
