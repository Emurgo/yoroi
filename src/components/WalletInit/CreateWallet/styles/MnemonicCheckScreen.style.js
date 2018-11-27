// @flow
import {COLORS} from '../../../../styles/config'

const style = {
  button: {
    padding: 20,
    borderRadius: 40,
    width: '45%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  clearText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
  },
  confirmText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.DARK_GRAY,
  },
  error: {
    color: COLORS.RED,
  },
  inputLabel: {
    color: COLORS.PRIMARY,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 18,
    padding: 10,
  },
  recoveryPhraseContainer: {
    height: '30%',
  },
  recoveryPhrase: {
    borderRadius: 5,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'solid',
    borderWidth: 2,
    height: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  selected: {
    backgroundColor: COLORS.WHITE,
  },
  selectedText: {
    color: COLORS.GRAY,
  },
  word: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 5,
    color: COLORS.DARK_GRAY,
    height: 30,
    margin: 5,
    padding: 5,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
}

export default style
