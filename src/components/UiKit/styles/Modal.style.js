// @flow
import {StyleSheet} from 'react-native'

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
    top: 16,
    right: 16,
  },
  content: {
    marginTop: 15,
  },
})

export default styles
