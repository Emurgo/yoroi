import {Buffer} from '@craftzdog/react-native-buffer'
import {decode, encode} from 'base-64'

if (!global.btoa) { global.btoa = encode }
if (!global.atob) { global.atob = decode }

global.Buffer = Buffer
global.process = require('process')
global.crypto = require('react-native-crypto')