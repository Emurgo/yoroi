// @flow

import {useRoute} from '@react-navigation/native'

export const useParams = <Params>(): Params => (useRoute().params: any)
