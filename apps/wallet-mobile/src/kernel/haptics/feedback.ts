import {Vibration} from 'react-native'

const successVibrationPattern = 50
export const success = () => Vibration.vibrate(successVibrationPattern)

const errorVibrationPattern = [50, 100, 50]
export const error = () => Vibration.vibrate(errorVibrationPattern)
