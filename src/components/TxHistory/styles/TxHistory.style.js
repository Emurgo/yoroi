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
  banner: {
    backgroundColor: '#F0F3F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  bannerError: {
    backgroundColor: '#FF1351dd',
  },
  bannerText: {
    textAlign: 'center',
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
})
