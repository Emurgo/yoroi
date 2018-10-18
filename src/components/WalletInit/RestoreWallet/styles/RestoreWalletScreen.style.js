// @flow
import {COLORS} from '../../../../styles/config'

const styles = {
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    padding: 16,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  disabledButton: {
    backgroundColor: COLORS.DARK_GRAY,
  },
  error: {
    color: '#ff0000',
  },
  phrase: {
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    width: '100%',
  },
}

export default styles
