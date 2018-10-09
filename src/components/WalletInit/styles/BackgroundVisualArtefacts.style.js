// @flow
import {COLORS} from '../../../styles/config'

const style = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  firstArtefact: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    top: '-55%',
    left: '-15%',
    transform: [{rotate: '-15deg'}],
    backgroundColor: COLORS.WHITE,
    opacity: 0.05,
    borderRadius: 20,
  },
  secondArtefact: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    top: '-60%',
    left: '0%',
    transform: [{rotate: '-10deg'}],
    backgroundColor: COLORS.WHITE,
    opacity: 0.07,
    borderRadius: 20,
  },
  thirdArtefact: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    top: '-65%',
    left: '15%',
    transform: [{rotate: '-7deg'}],
    backgroundColor: COLORS.WHITE,
    opacity: 0.1,
    borderRadius: 20,
  },
}

export default style
