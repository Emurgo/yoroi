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
  container: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 24,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  closeText: {
    lineHeight: 38,
    fontSize: 32,
  },
  content: {
    marginTop: 15,
  },
})

export default styles
