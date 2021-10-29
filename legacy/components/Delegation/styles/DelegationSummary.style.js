// @flow

import {StyleSheet} from 'react-native'

// TODO: Needs to be updated
export default StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  row: {
    flex: 1,
    paddingVertical: 12,
  },
  activityIndicator: {
    paddingVertical: 32,
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
    paddingBottom: 24,
  },
  itemTopMargin: {
    marginVertical: 10,
  },
})
