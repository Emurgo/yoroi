// @flow
import {StyleSheet} from 'react-native'

// TODO: Needs to be updated
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
  inner: {
    flex: 1,
    // backgroundColor: 'blanchedalmond', // TODO: delete
  },
})
