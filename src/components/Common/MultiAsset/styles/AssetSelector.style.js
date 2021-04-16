// @flow
import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 8,
  },
  input: {
    borderColor: '#4A4A4A',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  labelWrap: {
    backgroundColor: '#fff',
    marginLeft: 12,
    top: 8,
    paddingHorizontal: 4,
    position: 'absolute',
  },
  label: {
    color: '#4A4A4A',
  },
  assetSelection: {
    borderWidth: 1,
    borderColor: '#EAEDF2',
    borderRadius: 8,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronButton: {
    paddingLeft: 12,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 12,
  },
})
