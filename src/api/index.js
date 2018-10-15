// @flow
/* eslint-disable no-unused-vars */
import * as realApi from './api'
import * as mockApi from './mockApi'
import {CONFIG} from '../config'

const api = CONFIG.USE_MOCK_API ? mockApi : realApi

export default api
