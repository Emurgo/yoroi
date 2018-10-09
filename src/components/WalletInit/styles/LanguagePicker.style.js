// @flow

import {COLORS} from '../../../styles/config'

const style = {
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    padding: 20,
    borderRadius: 5,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.WHITE,
  },
  container: {
    flexDirection: 'column',
    width: '100%',
  },
  picker: {
    width: '100%',
  },
  pickerContainer: {
    overflow: 'hidden',
    width: '100%',
    borderRadius: 5,
    borderColor: COLORS.BLACK,
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
  labelContainer: {
    marginBottom: 10,
    marginLeft: 3,
  },
  label: {
    color: COLORS.WHITE,
  },
}

export default style
