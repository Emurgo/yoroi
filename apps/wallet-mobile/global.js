import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

global.Buffer = require('safe-buffer').Buffer
global.process = require('process')
global.crypto = require('react-native-crypto')
