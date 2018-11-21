// @flow
import {COLORS} from '../../../styles/config'

const styles = {
  root: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    backgroundColor: COLORS.DARK_BLUE,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 23,
  },
  subtitle: {
    color: COLORS.WHITE,
    fontSize: 17,
  },
  subtitleContainer: {
    backgroundColor: COLORS.DARK_BLUE,
    alignItems: 'center',
    paddingBottom: 30,
  },
  pinContainer: {
    flex: 0,
    backgroundColor: COLORS.DARK_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 15,
    backgroundColor: COLORS.WHITE,
  },
  pinInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 15,
    opacity: 0.5,
    backgroundColor: COLORS.WHITE,
  },
  keyboard: {
    flex: 1,
  },
  keyboardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  keyboardKey: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.DARK_BLUE,
  },
  keyboardKeyText: {
    fontSize: 30,
    textAlign: 'center',
  },
}

export default styles
