/* eslint-disable no-unused-vars */
import * as realApi from './api'
import * as mockApi from './mockApi'

const MOCK = false
const api = MOCK ? mockApi : realApi

export default api
