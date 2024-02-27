import {isKeyOf} from '@yoroi/common'
import {useEffect} from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {Logger} from '../../../yoroi-wallets/logging'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {connectWallet} from './connector'

export const useConnectWalletToWebView = (
  wallet: YoroiWallet,
  webViewRef: React.RefObject<WebView | null>,
  sessionId: string,
) => {
  const sendMessageToWebView = (id: number, result: unknown, error?: Error) => {
    if (error) {
      Logger.info('DappConnector', 'sending error to webview', error)
    } else {
      Logger.info('DappConnector', 'sending result to webview', result)
    }
    webViewRef.current?.injectJavaScript(getInjectableMessage({id, result, error: error?.message || null}))
  }

  const handleEvent = (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url
    const webViewOrigin = new URL(webViewUrl).origin
    try {
      const {id, method, params} = JSON.parse(data)
      handleMethod(method, params, {origin: webViewOrigin, walletId: wallet.id})
        .then((result) => method !== 'log_message' && sendMessageToWebView(id, result))
        .catch((error) => method !== 'log_message' && sendMessageToWebView(id, null, error))
    } catch (e) {
      Logger.error('DappConnector', 'handleEvent::error', e)
    }
  }

  useEffect(() => {
    webViewRef.current?.injectJavaScript(getInitScript(sessionId))
  }, [wallet, webViewRef, sessionId])

  return {handleEvent, initScript: getInitScript(sessionId)}
}

const getInjectableMessage = (message: unknown) => {
  return `(() => window.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(message)}})))()`
}

const assertOriginsMatch = (context: Context) => {
  if (context.browserOrigin !== context.trustedOrigin) {
    throw new Error(`Origins do not match: ${context.browserOrigin} !== ${context.trustedOrigin}`)
  }
}

const mockedData = {
  'b5d94758-26c5-48b0-af2b-6e68c3ef2dbf': {
    balance: '1a062ea8a0',
    changeAddresses: [
      '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ],
    networkId: 1,
    rewardAddresses: ['e184d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693'],
    usedAddresses: [
      '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
    ],
  },
  '7d43e99b-a4a3-4662-b94d-c3213fd9bba1': {
    balance:
      '821b0000000778175623ac581c05cd3ba2552706128b5f2be6ec39a65f323accc4debddcd81d86731ba14c5265616c4c656769745553441a00989674581c1511589366e825d1e47a0a597e8de667620e2dbc1b75a7528948ff68a34341534401446e66743102446e66743201581c44f538675b6b65465957ab82cd4bfb2b15e4c9d23734a2095df0b998a343d0a031014ae38386e382b9e3838832014e7665726966696361c3a7c3a36f3101581c4d99f2fcc2fd91aca97865516b8e77a8e6dc011a905b9960289833e8a340182a4356343202515634322f4e46542332323937373034343001581c5449dbad479b09de066bdf7934799c8a5aa2b66cf4a11eb759aa76c6a64f54657374596f726f694e46544c6576015354657374596f726f694e465473776167676572015654657374596f726f694e4654426c61636b506561726c015654657374596f726f694e4654646176696e63694d616e01581b54657374596f726f694e4654426c61636b506561726c3130316b4201581b54657374596f726f694e4654626c61636b506561726c3131376b4201581c648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198a444774254431901e944774554481907914577444f4745190bdb457755534443193a80581c775f356c756b70ca6b8e65feec417c7da295179eee6c4bfe9ff33176a34e54657374696e6754657374676966015254657374696e6754657374496d6167653132015254657374696e6754657374496d616765323001581c90b27206550b0c292bb40079c9b1a680ea2bfba8f45179170eb64342a245746e353031014c544e5f6e66745f355f305f3101581c9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842a3435634320c505634322f4e465423393036393134373201515634322f4e46542337343732393735343701581c9e5f43a9e77e4ba2e5c5db37daee3ee0a78bc87cdea3c34f7f78523ca14c746573745f4e46545f30303301581ce16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72a2434d494e1a0008d9c444744554481a0046fb2a581ce4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86a358203bb0079303c57812462dec9de8fb867cef8fd3768de7f12c77f6f0dd80381d0d1a000f424158206ef1cbeb2022621ec36127787664e92afb6a9169956863d63668995478a198261927105820f3a12ddb59ec26c91d1659ddad054bccd58200046a831327b4d99a7d1c82d4cd1a0010b51f',
    changeAddresses: [
      '00c056dde8a9d191989a7a5ef88d91008862a2db246dcec72743a182d4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
    ],
    networkId: 1,
    rewardAddresses: ['e0c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e'],
    usedAddresses: [
      '00a558e3549b281669833e06d24ed963e0b8e1849c86ca3b5819873b7cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0059692afbd2ee1bb08485611b3147b7ea095cc8649a916573d43e948bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0030b02a757b477e1b5acdfe1ed2c27a216528c2e663941cee11819df1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0000713a7180fed243a998c1c85543a3cc9ba7b6251cad1b9240ef7f05c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '009c339e360ef741b714455d3ab254e9cab9ec8052801810c1d7d65927c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b702112b82613ed4bb93595ee1f40394cd6e866c12964d1cccd6c4aac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '004de8e210b2bae0081851c44bcdd67fc794d17645f40c5aadca69e1e8c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00d5eaa269dcf4791d83c80bf3b0a84cda6749d2c55b40fe75835dfc17c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005ece700c9817197b8a8bba182a3779ec15e5cd2054057fb955af38acc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '009c4175768c5c5aceea5027e089356c848db62da05388c27f534afd2ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00025dbc1db88cf26d16445eae79f230c2d9c1510670161ed02d35bf1ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00fab8f45a07ed7cded5eaf95c1397fcbf19aed0d2de8a44911fb33a22c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a6038ef0b18cc17bf89909449c2444e9bd9c8df404241eeb722c37c3c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '009a6c0f31a7f1862a3ae6bc84192c0d997c88482c39e33290546fc518c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '003c40fcd134399e8a8e458348b9174d8bf10e12173ad61beacac8bb2ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b64d93b26fdd0aac7f58970a1d41900684533d33e8e13d0b1a4e1259c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00ca23317dcd6e8d093598b8a85b83c5099094202fb259e1524cb7f374c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f3154688bc1704c655942e9aae2c8439ebf9c82824d006ddaf1c1acdc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a8d1e7f64cacbf393cb85c4bac94852824631864a26117229613f494c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cb5ae38b269b5702a37959826b3e243e3a8e4d3d5e2af74e8f85e5a8c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005ee7bf1a97088ffc4b36b993fe6b3b3a63bdd5e361718fca9c7349c0c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '007e57cc9ebd214a98724500bd92a54d0d8b508b2d82e93e02cbc10791c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f1588be1771ffc5f31e96857acac80d26d3e7c5da68af5e34ac9c192c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a4822b465a5ee71f60aa92e2010162571d53f4ec1c1f994f4331fbd4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '008f84c9a26f740048d7fcdd31e82f2b4625ded8120fde90e699bd297cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0073729a8ecfef7e5f966bb75a655b9f9fc07ca23b3b19fd233b9ed95ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f89f73362152712ffc4389a0b57d4c4c3754c47c0d22dbd6995d62e1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '008229f5d3c5c43a7980a51d24ece2da3c1e9a56df2d53de7be718dcbbc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00afdaa851bcb315420648905add121ced38b1ec6cb042ef409376df0fc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '004fd6b6c81accc3e7ff1048a9906b5b3cf8e8d244893de838e3688b66c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0096de3dcea9079c420e113fdebca94fec92c1bde2e182ea20061502a9c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b74458342071573b2e27268d6e0c5076dddada71b150fdbb5b47515bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '002053fa175042b71b3c22c5a2bc413c7b379383bdf4d5be944899af18c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00dcc9d25a69749f862e79bbb62e81ecdc6e9188e773b64c27e7a63072c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00aa74b0502b2832d68a3751c52178f687e5d5ee67ad8dd91516494811c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00386744969a151572774d487bb8d73b2cc9d7d1392768f7340c8e1cb2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00eb7c56b50957ee3c5fb9c2c2852f7526207e08b3d12a5530e0260cb8c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a1c89d0446606fd0250cee9da1ce85a14f1eddbddf7c1c83171715bec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005add7841a61311b064fa9b976b0096e7ec6110f481c8eb221fc16a13c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00c2ec83d85d101ce1075c59fed0ab1bcde28d4e19d853d289ba5de04bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0055b1537697b96d534161fe592702902bc8b8551bf3ecdc483a4e066ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00893ca738b5daa2dc6161d75fe8a310252652a36e05b91732cdc83585c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f9e5e35be003757329875bccd1157526d95b8746ea637df45c282560c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f2feb0c8d5f4ae2dcdee2465817661e8abfdfa4e3f84d5c9f317e206c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005d72c5390e1e4be9264209920405f936de806415610fadbcc55b79b4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005bf56610471728da82bba2f41b598efc5e0bd8b5e4e070540a47bda4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b30a522bffec0b223d29f28d836d453f799bc7291f4f2349dc445c06c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00e967838844820036be828f34a5554c045d4eab54c4c83524a31d5ce1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00d82cb08650b9a52101832be882cd6fb11dc45d01fea6fd9a631fc3c8c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '008b7077a78b7eef540d53d2dbebc02b4a160a41b609e0b59ef7cf6d52c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f64b3ab7c619dc4bc4f97416b31cc6c2609a4806a083d9e59def2237c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '001ba9e62b76403ef531547584d602983f26ff1e3af052e95eec5e06f2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '000be969f857370e9d1b02704b46590df5b5f09d45555238fd1acde3d2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a60533bea819b4e4491ea02a1d9ebe28412b1a6c32e401dbdb8a953ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00897b068ded257c14660c3cf58746094533f8d2cf6de9af9ff60c2ee9c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '006c655dbe6db62484395ecb94f806a928b7d48f5035ef21789e042f4dc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f1f47670704ed09e31ef422cd5ad0a4d37ac2d49bbaab43e413bb282c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00815f032c70aaa7e56ba8d8c776a8cad7e9114b5c55ae7f0e81beea19c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00dd3a74be637cc8884a2be0c2400ab0c2192ea83b445f9c437f12cc0ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00bcb68502487c9985c7d4786b1c3a573172e57c09b385eb661e063395c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '006beeeb804cad4430f01f19959eec6595efa0b4f82c3cb2dac73cdb11c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '001831710821c49047cc12b6f768700e2bba5f871f657b252a864ec7d7c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00640ae72f8145dd05fd4929a5b1c574a8e4ebf61cd0b2c0f71f7b15e5c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00ea87d8361bafe055fe156e683cf7b4ead30d31b174a050ab66f6c761c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a361631b20fa3968f562945bf0767407bf7e9601f3ecf5373f55ef57c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00048805a800d102c753a5be26656126d7f452e7c94f909b49a1c1a968c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00e6f2c23095ac93ebf95e5fbf490f4a607b78f0330f3481d42975d016c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00575e453cb5bdf6d582215ab34fbbf7c585c0f6045fdbf07e21876d86c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0078edf5ae3f30a34393ad24ad870451b670f0a9feeff129643b96bcd6c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '007edfa53e19772d01097e86ee43dac68ed6ee059009cc03fb3dd28889c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '003a99be8229331ab000d587b5c1a797f3f7542c8caa95e4d871b65325c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '001920fa35619b1a7e9c7ad53826fbb5364c964faa1a9226ccc7fe208ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00df1847bfadcfee53eb0482c76eb50ddf427d74ad403a9c56c7948fdcc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00528651ca5f6b55ecaf693fbfeb324cd42ccb76acef1737b67fb84664c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00ac95255b8e1a0d6963fc5db4d87d54b417958b8f429a3ec519448a3dc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '000227800047efb01f48fd6a212759df753375703b6cafaec711831c1fc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0007bb2fba31aee04f1407a12baacee4943d8745ddc5c48f8b5b510e29c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00438267acdfff80b4a2c503948e489d454f92c86a20d93d15b28783bbc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '009eb1d3d77c69fdd4386f15bc4583ebea5004ee917935676f91ca9781c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00d647b6419a598471debf0924daa5d4049eae648b62f07afa751d1cf6c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00e1dcf0c30b2a7d17a02e0a60ef3b393b9d9053e07d67b92f47c3064ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '008bed8fbd2ada681cad614e777eb35e01c8c9b43eae414d706662d089c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0020f46502221abf27bd2a7c4af91340114dbe1fc0200f82164635134bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0009f7472dcd42e32e0805eee4732ff0c2123afaeb8a4901bab61ee5b1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00a97a695fcfdd0800113676451cbac4bd22011e607426415a5859159bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0060b7d4782db35e25efc569e72e43688715fc94c518aaf9844f05835ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00225e5128ccf9cea6f768a477364f3d55dd552a2ee2f7604cdfcf5f4bc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '001294da124e51fcbdaf7e4c973f2e5af6ad7c53a29e9719e255b600d9c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0094287a9c222f461403d61a6808c687a0f187a5393d5862029de0c6e7c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0020fd93abe506ceed075e3d9000e168927b7c1d5713e5148c0f9733b2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '001bc3e819eafba6906be2d3240a190b173847a97e55eaeb85f5dfb48dc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0043834e31f8e8e15b2ff70d32c1fd03e762174125139e65c41f7674d9c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00276b488a716fe1d88d444b132cc65e36b1ead3d0729174a7c50ee02cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00caa598da459c57c573a93dd1dc0cf8617e9b7f5f1c69b85ea0acc752c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0062d67147b5e529c3ca8168099694de755bbebe00bfd41d87943fa28ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0099b0debfb9d5f75daa4fd837ab8d3cbffffa474ce83a761b07345dafc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cdca25d7c0f63dbde1de99bc1fb6ed50a5575d1b6f4d048d4bddd3a0c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00d276767ce33e3185a8d2a6a5a6cc02700bc60d7185778fdf07f51b92c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0019bff6630d4fc5ed6106f4f9b3b0e33294538b25a408543cadb53509c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00259cec142ca9f1864cf6c24a4d9d78fb9ab8a646fcaabfd9bbe5feeac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '005b224cbc08b6420279a883b5ccba2ccc2f21c133a82814fbb255d780c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0079a6aa3b7c4451d5ddd2ce9a88e91d0fb67df7e17415c0c19cea731fc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b7a87e1a718e1e2f1505a1911eee7df38c516f2fdf7b087c5083f25dc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cb048febbdbee69bf5f5bebd2386decc3f1fd5474c9bd868eb6da1ddc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00636756633c442bc013ad5e65f0ba4a06402cf1feda93b42e673693e2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '002e0f923c154c68ed9bd7e8a67025de058cf8a493b9e434570d620ec5c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '009202c746db59a013d4b6fbcd9699ba325e37d18c7b718526594c1b58c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0099b4a75fc34e5726cb4b6959f451cd360b8104c31889228bc236e324c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '003c8a1db8945c2803718631e971816d5fbf9c0b5c45985dfdde7157fec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00bfa730475559e33c3f019fead46e284d1a2750b0ccc32eb7fe3204e5c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '007bc3a4988d6ce25f5ffe7e5b07325f64a90a97dc7205b1a13c36e0e6c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0089d434523bbe7f9d8232793ad9d0eee0d3df1839d1c3c4f4a48bcb9ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00898860df6e0ed22b51a717e5c3a84f6f070f6754bd329d25712dcaacc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0034ea52ef3bb9c380b8e2f44757fa4d4ae4b857522af2b02f630cafd6c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00c8e771880bc7f592aae6289732846822918e7f8beafc5be3df2eccbfc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b48f210d4bf7bd15e128e4743be2253a37c25cf22a81705154cc5eeac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00bc245d8e663cd14790287f41e6276f5a5230a663fe11b66ef67d0d83c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00157ebcf9a3920492548be7a1b688ab4ac5836292f6a781669ba4fa64c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00c5ebcd497c6cf6f132ad4d97b6fb26d24652abeaf3ff81d597315869c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0085d58e6e5ff53ac295df0be30a10e3263516b43bc5b95b9faa909279c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b3c85fe858e6388e1d6710e39b74fb8e8b43ee81ca04d8268af0920cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '003a9b209085359d70db4ccc8275e5893f7fe21e9fdea9091fd155002cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cb1ec8b37b2cb066fcca1fbd656c5c3403b977d0ef9a4a8a755723c3c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0001d326a5254faaf184f38e80c3c1b151d72bd6a9bf1fa5d55cc354c0c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f0e13c55c0ab0a063f0a5537f5c398be9c5ed67801102c79ff8a190ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00023332c21313380347755a16801a3d94b813a467520f6a629426c70ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00dbb9017269298f63846079df693bcebd717dcc0f5603303c33398527c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '008c86264aa71111117a5f4cb5b84fd1b102d4b3c59b1d89a9615225c3c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0037808426115b1cf448caf48039d532ad76e6d7101a752b44d9574f83c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0054a24cd2c51f100a2dadff64b5c14d5b35dffb03f5fd79ae73baa8f2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '002d1a991276184e1f0c18ad1a0f3ad30c60823c45daf17510bb9bd3a1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '004ae625f6bc1dbe36c294a6404dc5a1fa409aff4d6b75f82ff6e8d711c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cfb96e16acdc86d38dc3ba1ba46e277b9a5f61832e3d872f6dc9aadbc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00b67dbc9e55113de6a3aa2595cfdb379430f66aa97f494dd5f12d80e3c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00f2275da930b4d9a6390f46718ab86b91d202fc4db138ba8d921e6064c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00797c36c53b13ef17abe70ec1264be3e7357d91830fbc47ffddcd5d98c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00ca0f48f22bc61d6d0be35cce423271d5f6f510c36dcdd5a3812c2b29c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00783e89d9d3a2a10012bf388a69a2bb89c96aac8b3a6faeb382f8451ac3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '004fd422b1b486e9c96cf3b3535365472d401b5df8a233198583a83484c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00bdf2d502738e0fa4e78410d00bd86db16cd78363d28c926e05f6411fc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0012bcffb202069ed7c683f63862f68735a53e684e3f1ac55fbb19195cc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '003d3e9b4646c46ce853d4bf41744901cc4e040690cda0c2da0aec8fadc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0033e1c8c5fa611c0957ee1fb80b415673b499894f078c67e3ab8a4cadc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '0066391b83b29a5c2f091a590f2b243b0cd0fa8c417e83df70b9898bc0c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00dd14135891afdf19bd6959fc1dbf5cd3e05bb06e473bed43db35b51dc3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
      '00cfbc6dcdbf72672e2321c41405f480b49afdddd733c52502023f1064c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
    ],
  },
}

const hasWalletAcceptedConnection = (walletId: string) => walletId in mockedData

const assertWalletAcceptedConnection = (context: Context) => {
  if (!hasWalletAcceptedConnection(context.walletId)) {
    throw new Error(`Wallet ${context.walletId} has not accepted the connection`)
  }
}

type Context = {
  browserOrigin: string
  walletId: string
  trustedOrigin: string
}

type ResolvableMethod<T> = (params: unknown, context: Context) => Promise<T>

type Resolver = {
  logMessage: ResolvableMethod<void>
  enable: ResolvableMethod<boolean>
  isEnabled: ResolvableMethod<boolean>
  api: {
    getBalance: ResolvableMethod<number>
    getChangeAddresses: ResolvableMethod<string[]>
    getNetworkId: ResolvableMethod<number>
    getRewardAddresses: ResolvableMethod<string[]>
    getUsedAddresses: ResolvableMethod<string[]>
  }
}

const resolver: Resolver = {
  // eslint-disable-next-line @typescript-eslint/require-await
  logMessage: async (params, context) => console.log('Log From WebView:', params, context),
  // eslint-disable-next-line @typescript-eslint/require-await
  enable: async (params: unknown, context: Context) => {
    assertOriginsMatch(context)
    return hasWalletAcceptedConnection(context.walletId)
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  isEnabled: async (params: unknown, context: Context) => {
    assertOriginsMatch(context)
    return hasWalletAcceptedConnection(context.walletId)
  },
  api: {
    getBalance: (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mockedData as any)[context.walletId]?.balance
    },
    getChangeAddresses: (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mockedData as any)[context.walletId]?.changeAddresses
    },
    getNetworkId: (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mockedData as any)[context.walletId]?.networkId
    },
    getRewardAddresses: (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mockedData as any)[context.walletId]?.rewardAddresses
    },
    getUsedAddresses: (params: unknown, context: Context) => {
      assertOriginsMatch(context)
      assertWalletAcceptedConnection(context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (mockedData as any)[context.walletId]?.usedAddresses
    },
  },
} as const

const handleMethod = async (
  method: string,
  params: {browserContext?: {origin?: unknown}},
  trustedContext: {walletId: string; origin: string},
) => {
  const browserOrigin = String(params?.browserContext?.origin || '')

  const context: Context = {
    browserOrigin,
    walletId: trustedContext.walletId,
    trustedOrigin: trustedContext.origin,
  }

  if (method === 'cardano_enable') {
    return resolver.enable(params, context)
  }

  if (method === 'cardano_is_enabled') {
    return resolver.isEnabled(params, context)
  }

  if (method === 'log_message') {
    return resolver.logMessage(params, context)
  }

  if (method.startsWith('api.')) {
    const methodParts = method.split('.')
    if (methodParts.length !== 2) throw new Error(`Invalid method ${method}`)
    const apiMethod = methodParts[1]
    if (!isKeyOf(apiMethod, resolver.api)) throw new Error(`Unknown method ${method}`)
    return resolver.api[apiMethod](params, context)
  }

  console.log('unknown method', method, params)
  throw new Error(`Unknown method '${method}' with params ${JSON.stringify(params)}`)
}

const WALLET_NAME = 'yoroi'
const API_VERSION = '0.3.0'
const ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNjMiIHZpZXdCb3g9IjAgMCA3MiA2MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExODRfODQyNDApIj4KPHBhdGggZD0iTTU1LjYyNzEgNDguOTEzNkw0OS45MjEgNTIuODcxMkw3LjkwMjMyIDIzLjg2MjNDNy45MDIzMiAyMy44MDU2IDcuOTAyMzIgMjMuNzQ4OCA3Ljg4NTYgMjMuNjkyVjIxLjEwMzdDNy44ODU2IDIwLjI2NDMgNy44ODU2IDE5LjQyNjEgNy44ODU2IDE4LjU4ODlWMTUuOTUzOUw1NS42MjcxIDQ4LjkxMzZaTTQzLjkwMDYgMTEuNDc1M0M0MS4zNjM1IDEzLjIxMTkgMzguODAyOSAxNC45MTUyIDM2LjI2NTggMTYuNjUxOUMzNi4xMzk2IDE2Ljc2NjYgMzUuOTc1MSAxNi44MzAyIDM1LjgwNDQgMTYuODMwMkMzNS42MzM4IDE2LjgzMDIgMzUuNDY5MyAxNi43NjY2IDM1LjM0MzEgMTYuNjUxOUMzMi4yMDc2IDE0LjQ3MSAyOS4wNTU0IDEyLjMxMDIgMjUuOTE2NSAxMC4xNDYxQzIyLjYxMzkgNy44NTUwMyAxOS4zMTM0IDUuNTU3MyAxNi4wMTUyIDMuMjUyODlMMTEuMzMyIDBIMEMwLjYwMTY5OSAwLjQyMDgwNSAxLjA5NjQzIDAuNzc0ODE2IDEuNTk0NSAxLjExODgxTDEwLjQ3NjMgNy4yNzA1OEMxMy40MDQ1IDkuMzA1NTkgMTYuMzMxNyAxMS4zNDA2IDE5LjI1NzcgMTMuMzc1NkMyMi4wMTIyIDE1LjI4OTMgMjQuNzU5OSAxNy4yMTI5IDI3LjUxNzcgMTkuMTIzM0MzMC4xMzUxIDIwLjkzNjcgMzIuNzU5MiAyMi43MzAyIDM1LjM3NjYgMjQuNTQ3QzM1LjQ4MjMgMjQuNjQyNyAzNS42MTk5IDI0LjY5NTggMzUuNzYyNyAyNC42OTU4QzM1LjkwNTQgMjQuNjk1OCAzNi4wNDMgMjQuNjQyNyAzNi4xNDg4IDI0LjU0N0MzOC4yNjE0IDIzLjEwMDkgNDAuMzk3NCAyMS42NzgyIDQyLjUgMjAuMjMyMUM0Ny43MzI2IDE2LjY0OTYgNTIuOTYwNyAxMy4wNjE3IDU4LjE4NDMgOS40NjgxMkw2OS42MDMyIDEuNjY5ODZDNzAuMzkyMSAxLjEzMjE3IDcxLjE3NzcgMC41ODQ0NTIgNzIgMEg2MC42MzQ2QzU1LjA1NDQgMy44MjI4NyA0OS40NzY0IDcuNjQ3OTcgNDMuOTAwNiAxMS40NzUzWk03Ljk0NTc3IDM1LjI0NzRDNy45MjA5NyAzNS4yOTU1IDcuOTAwODIgMzUuMzQ1OCA3Ljg4NTYgMzUuMzk3N1Y0MC4xNTM1QzcuODg1NiA0MS4xMDIgNy44ODU2IDQyLjA1MDUgNy44ODU2IDQyLjk5NTZDNy44ODgxNCA0My4wNTMzIDcuOTAxNzYgNDMuMTEgNy45MjU3MiA0My4xNjI2TDM1Ljk3MTYgNjIuNTMzSDM1Ljk5ODNMNDEuNzA0NCA1OC41Nzg4TDcuOTQ1NzcgMzUuMjQ3NFpNNjMuOTc0IDE1Ljk3MDZMNDMuMTAxNyAzMC4zOTE1QzQzLjE2NzYgMzAuNDgwNCA0My4yNDE1IDMwLjU2MzEgNDMuMzIyMyAzMC42Mzg2QzQ1LjA4NzMgMzEuODg3NyA0Ni44NTM0IDMzLjEzMTIgNDguNjIwNiAzNC4zNjkxQzQ4LjY3ODkgMzQuNDAwNCA0OC43NDU3IDM0LjQxMjEgNDguODExMiAzNC40MDI1TDYzLjkyMzkgMjMuOTQ5MkM2My45NDY2IDIzLjkwNDggNjMuOTYzNCAyMy44NTc2IDYzLjk3NCAyMy44MDg5VjE1Ljk3MDZaTTYzLjk5MDcgMzUuNTUxNEM2MS42MjA3IDM3LjE4NDUgNTkuMzM0MiAzOC43NjQyIDU3LjAyMSA0MC4zNjM5TDYyLjQ0MyA0NC4yMDQ2TDYzLjk5MDcgNDMuMTMyNVYzNS41NTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExODRfODQyNDApIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTg0Xzg0MjQwIiB4MT0iOS4xNTU4NiIgeTE9IjQ0LjM4NDkiIHgyPSI2Mi43NDE3IiB5Mj0iLTkuMjQ5ODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzFBNDRCNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTg0Xzg0MjQwIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjYyLjUyNjMiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=='
const SUPPORTED_EXTENSIONS = [{cip: 95}]

const getInitScript = (sessionId: string) => {
  return getWalletConnectorJS({
    iconUrl: ICON_URL,
    apiVersion: API_VERSION,
    walletName: WALLET_NAME,
    supportedExtensions: SUPPORTED_EXTENSIONS,
    sessionId,
  })
}

const getWalletConnectorJS = (props: {
  iconUrl: string
  apiVersion: string
  walletName: string
  supportedExtensions: {cip: number}[]
  sessionId: string
}) => {
  return connectWallet(props)
}
