import * as React from 'react'
import {Image} from 'react-native'

import verify from './verify-address.png'

export const Verify = (props) => <Image {...props} style={{height: 40, width: 40}} source={verify} />
