import * as React from 'react'
import {Image} from 'react-native'

import chevronDown from './chevron_down.png'

export const ChevronDown = (props) => <Image {...props} style={{height: 40, width: 40}} source={chevronDown} />
