// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(74,74,74,.9)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 16,
  },
  closeText: {
    fontSize: 32,
  },
  address: {
    marginTop: 24,
    textAlign: 'center',
  },
})
