// @flow
import {COLORS} from '../../../../styles/config'

const style = {
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
    padding: 20,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  formLabel: {
    color: COLORS.PRIMARY,
  },
  input: {
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    flexDirection: 'row',
    fontSize: 20,
    height: 50,
    padding: 5,
    width: '100%',
  },
  passwordRequirementsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  passwordRequirement: {
    flexDirection: 'row',
    width: '50%',
  },
}

export default style
