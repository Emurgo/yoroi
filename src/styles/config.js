import {Platform} from 'react-native'

const brand = {
  primaryColor: '#0f0',
  primaryTextColor: '#fff',
  defaultFont: Platform.select({
    ios: 'Arial',
    android: 'Roboto',
  }),
  positiveAmountColor: '#54ca87',
  negativeAmountColor: '#d0021b',
}

export default brand
