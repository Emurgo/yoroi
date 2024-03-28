import * as React from 'react'

import {LinksContext} from '../provider/LinksProvider'

export const useLinks = () => React.useContext(LinksContext)
