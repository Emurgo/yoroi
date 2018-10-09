// @flow
import {COLORS} from '../../../styles/config'

const style = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  emurgoCreditsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  subtitleContainer: {
    width: '60%',
  },
  subtitle: {
    color: COLORS.WHITE,
    textAlign: 'center',
  },
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
}

export default style
