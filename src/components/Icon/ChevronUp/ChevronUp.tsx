import * as React from 'react'
import {Image} from 'react-native'

import chevronUp from './chevron_up.png'

export const ChevronUp = (props) => <Image {...props} style={{height: 40, width: 40}} source={chevronUp} />
