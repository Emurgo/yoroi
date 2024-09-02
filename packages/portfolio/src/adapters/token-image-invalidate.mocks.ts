import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export const tokenImageInvalidateMocks = freeze({
  api: {
    responses: {},
    request: [`token.1` as Portfolio.Token.Id],
  },
})
