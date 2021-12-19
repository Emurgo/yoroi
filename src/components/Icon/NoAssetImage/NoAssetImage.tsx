import * as React from 'react'
import {Image} from 'react-native'

import noAssetImage from './asset_no_image.png'

export const NoAssetImage = (props) => <Image {...props} style={{height: 40, width: 40}} source={noAssetImage} />
