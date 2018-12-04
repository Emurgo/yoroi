// @flow
import {COLORS} from '../../../../styles/config'
import {screenPadding} from '../../../Screen'

const style = {
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    borderRadius: 5,
    padding: 10,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    padding: screenPadding,
  },
  screen: {
    padding: 0,
  },
  mnemonicNoteContainer: {
    padding: screenPadding,
  },
  mnemonicWordsContainer: {
    backgroundColor: COLORS.GRAY,
    padding: screenPadding,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}

export default style
