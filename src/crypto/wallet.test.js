// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'

jestSetup.setup()
// We do a lot of API calls for sync tests
jest.setTimeout(30 * 1000)

// We have to mock config before importing wallet so it propagates in it
jest.setMock('react-native-config', {USE_TESTNET: true})
const walletWithTestnet = require('./wallet')

// eslint-disable-next-line max-len
const mnemonic =
  'dry balcony arctic what garbage sort' +
  ' cart shine egg lamp manual bottom' +
  ' slide assault bus'

test('Can restore wallet', async () => {
  expect.assertions(2)
  const wallet = new walletWithTestnet.Wallet()
  await wallet._create(mnemonic, 'password')
  await wallet.doFullSync()
  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(wallet._internalChain.size()).toBeGreaterThanOrEqual(27)
  expect(wallet._externalChain.size()).toBeGreaterThanOrEqual(60)
})

const expectedTxs = [
  '58385cdaaf65bd4cd9946820485aa44646cb254b8c680ecb08ae8b8287fbf847',
  'aea824d51464068f48bf9ae394b2eddce9641bad3130af5ab4d158ed909cac23',
  '1171e15787671586b9e3a588016ce59d33aa82f6c7b7657943a524cf5bbd9514',
  '4667bb557bfd4bc6cf1173c7b62545698bba3b4bae1f3482adcbda62eba6980d',
  '8468029e16aa1991b9a28744f668d03b79e312ff83e3cd657cfa6374e6da1d1d',
  'ad5794d0640e1ab941f1b3ec5b599dc19d7f7b91f79924aec1d26d0d848b2c56',
  '6cfbe4a20f2d26743a7b2c8382fe7d5178d017e07c502d7a4a91c6e669cf6ab3',
  'e9019d23cd280105fe8460b5d5da60739083c40ae2d5014848c9685b007ba842',
  'b7914b60bf3f168cdbf06c40494bc6c393dbafcdba92620a7f21e802cfc72221',
  'd40b3794018456f8a95a466386a958e7b7796feb2a177796ac08275938f421cf',
  'e69d53f739dc93f085f780dfe13a7f6e8714b291bd16c292ef9e96fc7ad73619',
  '41331f59efbd68f60da769aa2051a0f618f4a023027f14a170652c0a5d5775b5',
  'a67d53ea699b8c1666d3905626b218b9af6672c86db64a20de93ba09f2d6054a',
  'f2044ced04c95a08bbb10af4d23d375268c701dd98775161b05bf050f96e65bb',
  '15cb191633b9e2640226423eabeee1bb0d7358249b0e3dcda56f497d60adc85c',
  '9c867db28598ff2af32f851521f0ae24d6966b3422fcc134a9c0b0f3de4d9d11',
  'ed5ada88c0c9e38f85916fc6f505dd0f59e13e42a43d1e33105364f1a35bd083',
  'a04af461c8e5a5dad17d9e17f4825c56779c4ed53f44a1314f99b615380054db',
  '9fb8898af7cfb3e521987fa7ae86e2865fef080d93b7e44034d204189b0f52f5',
  '9492ad25bb1493db3698fbf07d2d2dc34aa7529ef3e600cb1e9213ec4e5ee1a4',
  'c8bf53422f68efe5ec63c79547e54e265ca165637f4fa00a549039a720518e9b',
  'ae7ce8567da4b37da8181138ddd7f341106e6ee16789c98a70c94899f6ef5f32',
  '6db5dee27ff5e0ef7729fe27b6bebbe9e7f160a5d1cbe056c53b77e086d6fb5f',
  'dde468d49114690a9a349900423f6c8d75982b648f22de1c3953e0096d2ba477',
  /* Used to be failed Tx but is missing from backend after rebuilding db
  '45024e12547232aed341af6c9b989067e45051a5ab04177b883aba31709f3a71',
  */
  'abee22c379bad4558f9a74b86e961710c02548ee2e722bc0c779522f3eea59f5',
  '3b49a079b265f98329565948acbddf89e75b425c9188873ea5cb0245248ef16c',
  '37551b1af39a2cd63413114a7c2749eec1148165d55e477d8cc52afbaae47b49',
  '394d6fc7b62a6955011f17f54d0b8b7e329083edcdb3f6defec79b32558dd263',
  '0b636fa8c0699c9fb7eeaae56def233dcb23a5523c8b183615c332ca90a92cec',
  'a400285af5029a870d190e54a8e1f523d22bf4ebb68c279f25785dd1c82d1807',
  '983733d8bfc55c3697c6202cd5357b206b46e7ab032dd02882b2374d01925f7a',
  'aa11ef13d32415be9d54393b2741ec6abb51dca45b79ec832900bfcb298e1cb0',
  '6b6869486dc7e8250b58d2d3a5d5e3b935293b13e076c4f9b8e3ba10d190ee64',
  '1aaf9df3c60b73acea0d21f5a7fab605f7f8f57c26268ffb75a274432143e92a',
  'b9361016aa663cacec00ab50fe414877ea78b9b211a9c53789fa8dd02fad4001',
  '36f6ee92612dc579000610586a0d0e759494ed4b42dd28e9920399a611057333',
  '8eccb3fdaad646d1555688bed714233b65c898ca8b9ce2a9c511384fccb0551f',
  'b6c4fa6af89bf7a327d2226f9fcecbf0363c24b8d5153829ac8619da23dfcf99',
  '29ca19753a5ca6610c1d39435d951000457c2710c68a7b3f3d672bc9807470b4',
  '5842711a96f002971ee1970d0dc092f048dfbbc0ce43de8e3190a3cd68531664',
  'c9620541e8f8ccd95633e817522f968a5f51093c68d1d9b8b1248cde7da2ef46',
  '3ee5827f90437db486f1e7f435982054bf6c43e35d21a72a4002bad9f976582a',
]

test('Can sync txs after restoring wallet', async () => {
  expect.assertions(expectedTxs.length)
  const wallet = new walletWithTestnet.Wallet()
  await wallet._create(mnemonic, 'password')

  await wallet.doFullSync()

  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  // expect(_.size(txs)).toBeGreaterThanOrEqual(43)

  expectedTxs.forEach((etx) => {
    expect(wallet.transactions).toHaveProperty(etx)
  })
})
