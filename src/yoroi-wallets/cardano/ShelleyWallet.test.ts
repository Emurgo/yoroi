import {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {WalletMeta} from '../../legacy/state'
import storageLegacy, {makeMockStorage} from '../../legacy/storage'
import {ShelleyWallet} from './ShelleyWallet'
import {ShelleyWallet as ShelleyWalletLegacy, WalletJSON} from './ShelleyWallet.legacy'
import {YoroiWallet} from './types'

describe('migration', () => {
  describe('create', () => {
    let legacyWallet: ShelleyWalletLegacy
    let wallet: YoroiWallet

    beforeAll(async () => {
      const id = '1234567890'
      const networkId = 1
      const implementationId = 'haskell-shelley'

      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share'
      const password = 'password'
      const provider = undefined

      legacyWallet = await ShelleyWalletLegacy.build(storageLegacy, networkId, id)
      await legacyWallet.create(mnemonic, password, networkId, implementationId)

      wallet = await ShelleyWallet.create({
        id,
        mnemonic,
        networkId,
        implementationId,
        storage: storageLegacy,
        password,
        provider,
      })
    })

    it('is the same ', async () => {
      expect(wallet).toEqual(legacyWallet)
    })
    it('same state', async () => {
      expect((wallet as any).state).toEqual(legacyWallet.state)
    })
  })

  describe('create hw', () => {
    let legacyWallet: ShelleyWalletLegacy
    let wallet: YoroiWallet

    beforeAll(async () => {
      const id = '1234567890'
      const networkId = 1
      const implementationId = 'haskell-shelley'
      const accountPubKeyHex =
        '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
      const hwDeviceInfo: HWDeviceInfo = {
        bip44AccountPublic: accountPubKeyHex,
        hwFeatures: {
          deviceId: 'DE:F1:F3:14:AE:93',
          deviceObj: null,
          model: 'Nano',
          serialHex: '3af9018bbe99bb',
          vendor: 'ledger.com',
        },
      }
      const readOnly = false

      legacyWallet = await ShelleyWalletLegacy.build(storageLegacy, networkId, id)
      await legacyWallet.createWithBip44Account(accountPubKeyHex, networkId, implementationId, hwDeviceInfo, readOnly)

      wallet = await ShelleyWallet.createBip44({
        id,
        accountPubKeyHex,
        networkId,
        implementationId,
        storage: storageLegacy,
        hwDeviceInfo,
        readOnly,
      })
    })

    it('is the same ', async () => {
      expect(wallet).toEqual(legacyWallet)
    })
    it('same state', async () => {
      expect((wallet as any).state).toEqual(legacyWallet.state)
    })
  })

  describe('restore', () => {
    let legacyWallet: ShelleyWalletLegacy
    let wallet: YoroiWallet

    beforeAll(async () => {
      const storage = makeMockStorage({
        [`/wallet/${walletMeta.id}`]: walletMeta,
        [`/wallet/${walletMeta.id}/data`]: data,
      })

      legacyWallet = await ShelleyWalletLegacy.build(storage, walletMeta.networkId, walletMeta.id)
      await legacyWallet.restore(data, walletMeta)

      wallet = await ShelleyWallet.restore({storage, walletMeta})
    })

    it('is the same ', async () => {
      expect(wallet).toEqual(legacyWallet)
    })
    it('same state', async () => {
      expect((wallet as any).state).toEqual(legacyWallet.state)
    })
  })
})

const walletMeta: WalletMeta = {
  id: '670487dd-4835-4c69-bedf-0901307c2d63',
  name: 'Wallet 1',
  networkId: 300,
  walletImplementationId: 'haskell-shelley',
  isHW: false,
  checksum: {
    ImagePart:
      'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
    TextPart: 'JHKT-8080',
  },
  isEasyConfirmationEnabled: false,
  provider: '',
}

const data: WalletJSON = {
  lastGeneratedAddressIndex: 19,
  publicKeyHex:
    '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
  version: '4.9.0',
  internalChain: {
    gapLimit: 20,
    blockSize: 50,
    addresses: [
      'addr_test1qrxly58xcq3qrv5cc8wukme7thyv22ewaj0p5mkumuuvz9dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7dpuqt',
      'addr_test1qpm4edmwq9lzy3vys9guq7ca9mpcd44xyfu85kc3hjzdlkav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7jfk58',
      'addr_test1qqavcydjctjl5z8dss56zuqzw6gv42cu96pmh9hfmyz425dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqu54d58',
      'addr_test1qzc3jd2qh4r93ez5p25mr8eqcfl4kt95v6pzxex0juafumdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqddaql2',
      'addr_test1qr9f45tl8qr9carhl2rwswnsr7xqyezepe4cc6h52tc5hfav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4z2wf7',
      'addr_test1qp0jjy25whesrqfuzw6xvz2t6tp080nz6x9j94nlj4hj7q4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvg2dtd',
      'addr_test1qrgy4gqr7r8r9tt2y59sllct40r4kq47vujvz49lgrptq6av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcgjpmf',
      'addr_test1qqylmc7sq9k202mcpnp8ydwkgkd64asr5eglhptkwx4tml4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzqmdps',
      'addr_test1qpt4gfjkrgxj38mn0pxz4t8zdm8n6j3xtv6xkzpulz0qr89v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkwk474',
      'addr_test1qr6396dh32qxujzdljhnyqaae75ureqly20ygmf9r8xqk9dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmg2wuq',
      'addr_test1qqkadg7zqdtfpa062vs550c3x5wasaq6pah6cvu8yysxyydv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkf6p70',
      'addr_test1qzscqyxzvcl6l93z5zk06p0npyh6zljgtz24r2mwh8s8xs9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqdz4df7',
      'addr_test1qqenwvydls26rnjrrnn5e40ttj0vraz9kha8zeemh9asg7dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq0ytkun',
      'addr_test1qq92vzj955006aqrgjxq8eltrjn32jv22snzfkxc3cg2v69v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqx3sggk',
      'addr_test1qzu6f9v2h8u32qzct2em263tg0tkyclzcwcdta9tack0qm4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqqph4m2',
      'addr_test1qz6zksc7kpjx64ty9wmp8zfnskmrlfurmx28gnve7qredzav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq62l25d',
      'addr_test1qzhvw4zfj0am3sl5jxyqsrstwvd2zm4ecrq3u93kkkdu8kdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqp7s83p',
      'addr_test1qpar856dg767zyej0sd0qe5jwpn8d63d42vtda3dw3s4h49v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrpdmg5',
      'addr_test1qrg94rqfw949kup79k4vn4zjwpptze8glqukkhdf5hg6zadv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5g647w',
      'addr_test1qpm4m726r0dmp5ud7wqkaysx9kxpe7q7ax6glrq40hqt899v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhquw2d5f',
      'addr_test1qzhmmp6st263azmqkduhu68dd0fw4fntynvrppdnd7etczdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8fj5r3',
      'addr_test1qzpg4gdxfr95d9mhcksyq3au8zju7w7pc5rt5pg4wdmjws4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmlph6s',
      'addr_test1qq0e5g674ghvk5smp3jsw84af4vhgflqd5t29fkkvtlg789v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqyke6re',
      'addr_test1qzphgm2nm9qgh6svyg2ax77npnv632vk2z7qh0dm2rp2lnav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7w9fvs',
      'addr_test1qp59ms2sxj93lqmzylcgq7yemydas982czjxdf2l826x2c9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqyz0a3v',
      'addr_test1qpmjhzz9rn0u5neextj3zl2ruaawxl94tp3a7ku9mgt9mx4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5l0gps',
      'addr_test1qr877tcyc680gvqc75kxxhmw6ze5sx85yrcx5tkvmgt0gxdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq60uzrv',
      'addr_test1qr5axm0dmrpsmgdsc5mvhrk73n0vhmrq5vl6z3dtwgwc4k4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqx57wwt',
      'addr_test1qr6v693hhchr76wrxuc0m5zc6a4afrsvcqpeagd5g3jeyeav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhql5nkn5',
      'addr_test1qqkfdwyadhddujmxc6fuf80j239ysddkp20uesfh0v5yw3av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqq4k6va',
      'addr_test1qr9hdzh2ph8sxt4w9ayr7hfst9yyk9ecrh7e3cleutwzjvdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq367hg5',
      'addr_test1qrenrpdn2jrda4etnu6cvjzcltn8av4tjp9qn5m2uexcj34v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvl22vc',
      'addr_test1qqfqm4a5jdygyk7y3k802fzf29cxxawt2rwnw7l5q2e3gh9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6hhy9a',
      'addr_test1qqyzcf8ptgd5kmld32pv23x5c9tez394a2aje2s648rw9vdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqjh4jmr',
      'addr_test1qrm7g56d8f38xnhkng2vl54gukwmf6j6ynxdgpkk8exz474v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzcv9c2',
      'addr_test1qrgtwqw7pyxk9mv9rt3kewql978u38tnyl8q8spwmadp2fav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9c0k40',
      'addr_test1qq7r965xm0g70addwr5ujsdgaep8msegtzqrd79zha4jff4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgs7frz',
      'addr_test1qpvrw7ug90kcuf3xt97x27dfrm23fx9uukgpkkhwpupjv84v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5g8kf0',
      'addr_test1qpeqtrhy7m0tu3u53r2ckp3wftjtmy57lyeg7fneqm4nkdav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq809h7s',
      'addr_test1qpvyax743vxep820l4hnsahpu2zf86aazm66zvt5m99svxdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhspkam',
      'addr_test1qrv8t07ps656azup88ed8ats6rr3z4r6t4f6670dqm50zgdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqee94gg',
      'addr_test1qzl6yyjcuqy3lw0n5n0sr22ksjwywknj7gah0wahw38p24dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxk5aqj',
      'addr_test1qrx9mr9pt8tu62ly0sr52zw379y0dwryrplpswn5tud0fl9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4yn7ka',
      'addr_test1qq008df89jswt73nc9ct2fx4ex3kns7ydw4gcd80cgt7agav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4hs7t7',
      'addr_test1qr8nru7gahslw7vpajd4pdl4skejc4pv8dzdxm94wseucsdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkcgrx7',
      'addr_test1qrknlmkdgul4m540pxqvp6w23tfcrd6csjlsn9g5wgelfz4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqk6vyvr',
      'addr_test1qqq6p9rwzk279s0np4whpdsladtucznkrnsveg8dwa6ztt9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqjf5wwn',
      'addr_test1qrgjhg36mw0h0w7k0gqea0ycvxe2hpp0ds94pzfjyemguw4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqu4gxwa',
      'addr_test1qrz5hktzvgc5u83ttc78sv7ucegwhchx6fmguz9pcy23mp9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvawmdx',
      'addr_test1qphsqep3slga7jpqrrawmhlsw2tll6607lsajc7mwhxzjsav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqjwr98u',
      'addr_test1qpcd4ykupd5dl395klf6cfwxjhqfwr4nv7eg60kfpvw2ujdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6cmj5m',
      'addr_test1qq63p8zr3w4zy4ze8staglnjnhdjjuw7zu5lc8r6vjc42f9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqud8vr2',
      'addr_test1qzv25nlxz40ah0ymr9lntj8mj7jfvy9d3z4709v9pgg852dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8g6qjj',
      'addr_test1qp5vlcp38gadc6e5y0dnpqazapc3fjufxuezt3l3kg4zg04v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq2kmx8m',
      'addr_test1qp9ak2zrk2xcxzr03rnpgt2ufzaj692shs4hmtvsnnwrzv9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqlaw5yu',
      'addr_test1qz5sh9yrr2tk4cstq274ypsqvj5p5tcd3dhta93gdgtev5dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqppe7nj',
      'addr_test1qrq0nm0uf8z7h7m03yetdm33txwq7ln2aah2ltzs8e0txx4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqr4rdrq',
      'addr_test1qqrrw4hfwk6gzxjdmmpfy6xs3cy2qx3udfwr0j52fatjpk9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqdagjqk',
      'addr_test1qpd7p7ge726vyx9kgvmp8few255th2pd4k936jfm7qh8ac9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrz7mux',
      'addr_test1qry804r3tpn9cedyj0th6x22fel8u9esktvnj8plahqwxvdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgr2w32',
      'addr_test1qrtghr8scvj9dq3vudzq8yjyxg85z54530nv22p9fs6ee8av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq472tmq',
      'addr_test1qpuhwv0g0jcgydlwez7pudrhagrnjakstsdyk7p7drd02x4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9fvkpc',
      'addr_test1qpsf0k29dwrekzvmrlqv7c2jaswm9tqlj7n482ak7wsse0dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5zwzfc',
      'addr_test1qpjwh0vcc6cpf28sxa3ffmnay5f4l9xn33kgkw00s06pu6av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqz6uj4e',
      'addr_test1qrkkvy4c7e7p5g40gulldp58vznlv6mzyw9p8fm59k69e4av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq72j8ax',
      'addr_test1qqa7dfekdstkfhepewl282d7n9gaku607mgalv0z0yrvynav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqh7mesp',
      'addr_test1qz7nayey6yvhuzda6snm22w9qyxlmevstua7ku488zuhquav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqurugmf',
      'addr_test1qrqlueeanwpqxlaph4sngwkh6st9vlagfslwx3rdgw9j7ldv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6a0gr7',
      'addr_test1qqehrckzwwmgsdjgfascrn0jfx2q49f7sutlhhqxqzpemyav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq393dn7',
      'addr_test1qp5hehm3970cf8s99dafh5cjvdh63r3sl5yshjas83nkmlav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvxudqu',
      'addr_test1qrxtgw9z83nna4rhrg678lr08ahlhpun4sv6etk9d25mmtav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqpqlh34',
      'addr_test1qqawmfmfax09sz4ks6ye0puc46kp5f3sgu2ccmn2wsch7m9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwc7dnz',
      'addr_test1qr8z80j3r3e83tc4e5dqf95t3qrvga7rlcxqu0kmhhs88l9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxdzffr',
      'addr_test1qq8ss0qyxke4rexd69vv252rj3jxju99hqmz88762d4fvgav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwe58qa',
      'addr_test1qr0efvs934zuxtyndtrq7225k8p603t22dufge8dca4cd84v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxal3us',
      'addr_test1qpk3xrtqdj34hyf9h2cmjnmvenxd7fzse8jjuk2uezltc2av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9vj3y2',
      'addr_test1qp503fw9dt4jm0st8cjgla0gqzdzsr234jp8w3srh3fjut4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqanh3yn',
      'addr_test1qpuxfkshdw3n4rzfj286tgc5tj04ckwgv0lsf8kmn4nv4edv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqs6s3mm',
      'addr_test1qrfyedxlrzwk0jd4z0lk0jsrwn4a4kx5784xudv25yevjy4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcrlk02',
      'addr_test1qzvv5h3el5r0l0hlepz6z2fh9drvutvxzwkssderaa5acu9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqsyvnrm',
      'addr_test1qzpkf6xc0n2ysc30llaes7q4nwlraw9g8d9043s76klt9tdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwzfjnu',
      'addr_test1qz70xwkrje9cgp4sjx4pnvq4m0aj377nfxameukuc60n949v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkpa5m3',
      'addr_test1qzumrfmglwtp4ahm8nsrqke8a7mc7puf0x8cu89r5g88aq4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqaqajhv',
      'addr_test1qzsv4mj7v4w3kqxm5u0wwyng4pawdptzw3pv4wx2xsvecjdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6sg25j',
      'addr_test1qqaz7qafuzwgn6qm5xyq8fgwze2u0lacapfpkt5hnyvs07dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqs4rs8x',
      'addr_test1qpgyw7utrzzu8pgfx7ummwmgp6uac8jr5mvhhtumk93nl69v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5yx2rj',
      'addr_test1qz94d3ym9yjjzhglwcgeajvuhua2mxrv9gt0m8jgcx8gn0av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzz8ph2',
      'addr_test1qr8lfcllk6hg3hu94u4e8yq40d59egfam6fnme9xq7w029av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqa4m2nq',
      'addr_test1qq4magusgd32dep5q78xp54lpyu9kz2dklw534pcnfz79e9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqpehl84',
      'addr_test1qzwaucjfzz54y2vk4re9v2gskl407s0c7yjh9qnvx7gfa7dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7wg8te',
      'addr_test1qzrewrll0u7uuwqjdz225r3uhqedz3gpdpzp3z0uf74f7sdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8kh0gj',
      'addr_test1qpln48lus0c9zvckv853c29lhpzxuurhjy44amkllh0cusdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6aju26',
      'addr_test1qz77zgq674g8t45r9sqd5y4vzq9u9penlghmfujsr7s090dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqm2wkrx',
      'addr_test1qppmyc82nu2j5myz33hgm9xy829xh3hensfndd6u6vqvmj9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkwauk0',
      'addr_test1qqy3lgq3lx8z7c94s2qrgjau5698cjwysl76nl42zkvuz84v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqd2mycj',
      'addr_test1qpf6rnvs3e74wjfe0k02glg3qvnqnjqawrakhxfzhazzepav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqy3tyxe',
      'addr_test1qr0tsnfx2hjktfu2zddxjfj3fdul55szg35fr850eeknwc9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxvpzvx',
      'addr_test1qz9tfyg2e4mtnm6c9285y7l39z72zey5r77c980yu0k960dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqv59f2r',
      'addr_test1qr9nspce3hhvve3t8q4udw3xyej6e3008j6k6j979xnxpuav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwws3t6',
      'addr_test1qr6a0gj2qzmfhn32dgzx93meunycgaz9ll0kd0ftuvjv5rdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq48z6g0',
      'addr_test1qzf7c5ekzxtyu6vdcksmazqfa3yy8xpwyqlsz9674ekyru4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcyyfud',
      'addr_test1qq4njfreynmk8zexv8ykh2nryxlpl3vxn9gjrs3yxxwhzkav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5wwpfe',
      'addr_test1qzuasf7hknm82jymzfj7869g8gq9mnc0qe6jlvqmtczuh94v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrl745w',
      'addr_test1qqn3esqepxzyqsfws8s7g2udk9pu8y8zujaqsj95s9xax7av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqq4ndeg',
      'addr_test1qpx6z87ftc2ndzun07646t6n26waa270zmhm7cgete08ydav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrs44aj',
      'addr_test1qrymda654080qhjx50yexv9unqwq4z3ddpv7c63vj47rzqdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9eyqpv',
      'addr_test1qpuycny94gvkcjy208gk43vgpqw5cr996tpmeyy467yfeeav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8efjtz',
      'addr_test1qrwj42jpc3dqsmxtfu6q2eegecc7nauzejgc6zd0ycf7fj4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqjncpk3',
      'addr_test1qzrm7434w4ta7pdt2lyuqj9e43gctx40dlw4xyjy7a3grcdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqw5jatm',
      'addr_test1qrehd2q6m58aywjqt3kqft8jsp0cxp4gpc5z87pvl0qfsj9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8gmt8h',
      'addr_test1qqpmacfxtt3xv0mf9cp6wewlfj4kauqpcze60dxcl7nmgddv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqdwjjy8',
      'addr_test1qqgxd764wn6lcgjdka9xuvedtgpv3ujf58xefs7gs9p0up4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqdevg9d',
      'addr_test1qpx424d2r3prjcf97ypgkhxkqnzrvmnvhhhd9n78r3epum4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8p0752',
      'addr_test1qplqwc2k4yymwexvuu70pwckj0ctnkea3g43srkx2xnf4vav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqar69wr',
      'addr_test1qz0sqw8k4um9z0qspsvrrtpttym82ee8z8grj785je0wp5av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqp8hpsw',
      'addr_test1qpqjeg4u24xpt7f5umzm9vzvym6qmys2fpeynfxmthkr0hdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqqmutud',
      'addr_test1qzwxnndwavfcza4rly0xwu0enfjv2ua3a5z8qzut6lm7ux9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqc3z30u',
      'addr_test1qz62sdz20wzw3kcd7v05f9w0v739sv5e9zcfgx3lyr3q2u9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcvu48g',
      'addr_test1qz77vad9rdy8cgj3nftnvqey5x2pm49fwlk6csj3jtsxyadv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqm4s7a2',
      'addr_test1qpfkcxgyu7wv3mcsvyup7dw2pc7v8gaanhrelsr0dz6kt99v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzkwvse',
      'addr_test1qqkd835fqs99n4hfp69ql9ehdazkd99d0afezvl9dxe22kdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqfkc7dt',
      'addr_test1qr58xgxjf7dzclc805kjl00t559uf75d2vlxv5fk9d874m9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrq35dw',
      'addr_test1qq4a0lqm8hyw0yvuy3au8kqqw0lyzaurvuy8nz7a59ct229v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqaqcalr',
      'addr_test1qru8pup763m8fhh8rdurzhlev538r3pmg8j6k9tjwatuptdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkh0pq6',
      'addr_test1qzqar5qlexzwekl3n2ptdvmpplerf9949eth42avsn89hxav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq3x8hzh',
      'addr_test1qz86fthzfq6dwftqeaaz28uu2msgtnnzd2dzrllv0ckxgydv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqty8xql',
      'addr_test1qzc3vr0mjnyjjplnjf2dsw8vsfkmn8f80np3pyln24fvnlav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqkeuqkn',
      'addr_test1qz68ku3m6q2fllpjc5lt35jwj4enmhrfg7s2szyr6ca7sddv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq40q7tj',
      'addr_test1qqgqr75p06wepg5dxlwwakn8l24l5kj85unuuf5nmrfhwc4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqeuaw2e',
      'addr_test1qq2t54z3fta6clmjhzzs54arug2k0rvvj5mv6qep77lu0sav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4sa6ky',
      'addr_test1qqf7eg4hgz2q5vqw0cd7ql78nthura6pg85004vj5anrw04v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqv998s5',
      'addr_test1qqjtpmslgm8y3dxyeu2v6tsjnslmcrtt2x66fmuw24u7zrav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhyr0ps',
      'addr_test1qrj5wspnvr7ha4tek2vhmvg4wz75sznzyypec6efuzdsdg9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqlutk7n',
      'addr_test1qrt5n8qat0x7ahvtkuakklu2hqz5tz5nymjpsvw3krcv42dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgynetm',
      'addr_test1qqnsd8qt6yjeprcx8rsdud97pcqfh89ua5gq0ew6e5e2w8av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwy4u9x',
      'addr_test1qzen9gnhdww5r2tjgfvtl3tte67vlnn4rdhgw2970h5d3yav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgmv9ec',
      'addr_test1qrhla2637mu02enda3tf8gcf5hmjwmfwnzwmsns5y5cutk9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqe5pkkg',
      'addr_test1qrdr7ka6sdy5rnatpn0m0ntt45udr5d7m408gt4tr6j7mpav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqchehc7',
      'addr_test1qquk7nnqg9q0dtey5n6j7lwllwa4f8dydugcra4ftyv3d5av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq2fmqqz',
      'addr_test1qq8250dluw52sg05c5mx8z9y0nhqm4svlk3xyqjamc68pkdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmfur6u',
      'addr_test1qzwt4ur8x8ggx3wxzrg6p8hsy0trmt0d66dg8lu2tq5an0av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqt3sywc',
      'addr_test1qphq9ypjvhc76g3czhgfqqn0p53ym0wwegxkczyjz4slg7av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqsmyfgv',
      'addr_test1qrwhv475a0dqx8wxsx9meqvtk4dd4vfedhpyyujk8hft269v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhquwr8w6',
      'addr_test1qpaknkyjtl0gv54nxulkvr20fclylkwnxnenx3tw7q90t34v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqej4whq',
      'addr_test1qrzjk0j9d479jvtjq9t8lflhhk6sq678dvtcgx9uf9hx0p4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqm9328f',
      'addr_test1qqxk9g4fpjh3vml7g7k9vzjrpsjh5rqtgq3gj92k24lkzmav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6yys6a',
      'addr_test1qqlahcfe8pzqpjezw8j9uzptahu9f93tmh6sue6j569qhtav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqc7qzgr',
      'addr_test1qqvlnuwvsqlxun9q9qtxvusmq3hpc9v2v520zvp65ycqdt4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcn7uss',
      'addr_test1qze2gvdlsnjrp8rf388n3zu7yfh7hjepjhm9ujgxuwwqwhav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqr6aaeu',
      'addr_test1qrqpqwte35fq5z9m2wppqejw33yn9ge4kq7e7vqe05hqsu4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq65ktgx',
      'addr_test1qpq5fye22fz6smx0mzg4qxf95gf87z3s5v4d9qfgsvexn89v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq39sy55',
      'addr_test1qq74rdk50jxa089fy63hw376mcn8sddy2crzxq7ymanfqn9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqckef6p',
      'addr_test1qry9nj4j8k647xqxhacp8smu0ugh7qqn6s3hlcc20dmfcfav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqz02gkh',
      'addr_test1qpuzz80989vjwscytzcnn4f7kct9jj3r7cqn7elnm7xlcpdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7vzk22',
      'addr_test1qqv4am9gjqu7uc5yj4sr0cz6c57kqetf7jd3y2sydf0aavdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqpqpec2',
      'addr_test1qqqmhmyc8qstl8r7g2lv7wvdpf0lrd6des3rpr8tem40wjav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqlamw4g',
      'addr_test1qzrj92lrsf37mjn74dwv48m96w4r8ujy694y22xy3szccu4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqlgv333',
      'addr_test1qpttg9c9hd4rpuxsm24fypffq75srzph9h8hjqz6mgha2rav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqjpmm5f',
      'addr_test1qqa9jra9z7w0apy3syh0k3wsj34ydrnsugpltwtg8f0a9j9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqs6tp54',
      'addr_test1qqz4j2dsavwdzz34qeqt3dzrhlc5aruj3mnw9dqjkacrcw4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq74puv5',
      'addr_test1qz4mdhsfhh0vdulnv2vzk0eth86ydm5vu2h8zp59hsdmkuav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqghh4da',
      'addr_test1qqvsxnt77kt7vphu7t5q7c4fdfpn3y0u2l4v584mdl5q5tav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqqh5lq7',
      'addr_test1qr295t0z5nnkuxxcg7cpn03wv68fu5ylt97jlncak0qy659v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqshppt0',
      'addr_test1qpn5v0mf9r4drj6cw7frf7jdwvyyf23486jkw6ljwtq6sfav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvkh2kg',
      'addr_test1qpmtuh3eycasdnykr5ekceqzgaxuttyehklms4uhpn667cav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqn4ymhy',
      'addr_test1qzwe43k9sf3j7v2tjf4fzmr5ke9qtlgzhzj9he673eh84j9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqu0djur',
      'addr_test1qzhja0qvj46w42ma40nue2sxdvh2je2rgnvu3vwyjrvl7d9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzjdn78',
      'addr_test1qry6fsqf2edz3rgsgw7ywf6fhn3hv52xjwmeeesz4ej7d9dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4x4zvg',
      'addr_test1qqarcqpejuzwaj2x33qzcm3gl4lug5hgvu8v59x6765hv8dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqqzzupp',
      'addr_test1qq68xuwy7w5xrcsw35g9gva6x2r8du3dxqpyusve63vhax9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqv2wwvt',
      'addr_test1qp7kzhdmzayl8carj0hxl9glp2whzsgps4fmc30uh0x6h9av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmgle8k',
      'addr_test1qrqyxxaw6xyegs2jsrr2cjlkvj5a8pum9uxg7xnnpc88h84v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgj4sg2',
      'addr_test1qq0a648qshhrdeu9xrawsl62mx3tyhz53kwtdrx2rxvpf34v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqc46ja3',
      'addr_test1qrrvv7ycyewld8jl447cr6n775ma8hlpwzkfyucmz9ju4fav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq3ag84u',
      'addr_test1qrsu52dzrwes04j5z9rw3ducuf5wm66che87xj6njwjttnav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqfth8cr',
      'addr_test1qzsmphy4r0amtp4yv6mjz3mkze8eamynn70p8f3utpg28d9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqhyehys',
      'addr_test1qr4l44t3jxtxajd0p73l7mcqm8jrpvfx4w279pqrunpncrdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq3qwtfz',
      'addr_test1qz6t40snct55mvysyp35t3ygvdn8f9jrm3zg25mnx9nd574v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqaz8y9h',
      'addr_test1qz7flw240v59gxn5psygt05rdat4wfc67yd5zu8gp8vevj9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq76sju0',
      'addr_test1qpzws79k4ydftggg6pj3sz42llwwtwfs3nvpp06yp8jzl6dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6hqysx',
      'addr_test1qqgupwtc88mudnjgn7v2vz35l82nqda4ghgse62hts4pjgdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq2jt8d5',
      'addr_test1qq33rhaxmltkfs2qa92v5r8kv7fqmxwma0fhshz7x5fr2a9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqg0a5m7',
      'addr_test1qrcs5jed5zl3qqu3qanlhfsrveh8jygfhxaamn4hznjzuqav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7kuekp',
      'addr_test1qz2wv7gwglagweqfwwmra3kjlfp470euhf6ntzk33rp2p64v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqq99pgk',
      'addr_test1qq7rpwhq5kpp43n0lvne55fy4sdefh0tx594fmea3ktvj99v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqsg536u',
      'addr_test1qzpvr03h6nfmq3v79twu4xegussn4k5vjaa4kq9ew45zwddv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqj9f3kx',
      'addr_test1qpptjwp8xf5jlky4xmj4kel6856d3ev3wp40n0v68jnwqldv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvgs5ky',
      'addr_test1qztupmz4yuw7ffpchrf8hsses5wnlry3cn7a4ug0js4nym4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqawrh5g',
      'addr_test1qzdeqat5v5eaa4427st6aujs63ya0vmzgsspl0zd5qf24h9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9pyyrq',
      'addr_test1qqm6hcuxkpf3zp45dzlwfxqvuypvh2jvmm8gvq7mjm5uhq9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvzfs7k',
      'addr_test1qpc5wc5lunuzmlvalcrd6kdazd3vnesdj3rrw3c3xgrwnjdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvdd94x',
      'addr_test1qplklugalzxcv9ynllxf37zjl8r2ux45xf05x3htl0ydkldv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqtw4v28',
      'addr_test1qpffsxvny8h9fdw0xcknl3x3eqftfe4svnhlzlhyz4kt0eav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrqddr2',
      'addr_test1qqn26a59gagy8qsajccu7du8hathdxhpdpdze7gf78l8fuav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6p7nx7',
      'addr_test1qzk69gkkt9ulzmyrmwmvrr90t575dv3r9xnmnentr6xungav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqplu8ve',
      'addr_test1qr6g866wjqmrc7w8532ff5eesjx5vx3u8sezy45u8rzjyddv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzpkzzh',
      'addr_test1qpcw0kd995ccc0es028ucqsjyjf2q75lm6slq89zykf2g9av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq0gd65e',
      'addr_test1qrfr8zw3sl46el62jkpzjtgvtkzagl3lmdgts6rfulcrfqav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5uljal',
      'addr_test1qzhv8wf03n7c550l8jx6nlut8fv5uh9prd3v27tszqglahav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq72c48d',
      'addr_test1qz6dtd77e4anecamr3f5rl6snndlhhthsjykkunug9w9ut9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6qg947',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
      walletImplementationId: 'haskell-shelley',
      type: 'Internal',
    },
  },
  externalChain: {
    gapLimit: 20,
    blockSize: 50,
    addresses: [
      'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
      'addr_test1qp9u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq94q330',
      'addr_test1qzacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7d4wlv',
      'addr_test1qpgqhazc0260q9gteg3ya07hj4x9qkf2el69l3yce0hjhd9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqf59ps9',
      'addr_test1qz8mallfukdndrz66vg3a2933pvwjmenvx9vvfy87cv4lyav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqd866dt',
      'addr_test1qzylz20k3ll9yuta2a8t3d77x3ucwr2ph0wnzh2them4z0dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqcmnjhj',
      'addr_test1qzuxrm4dmccq8pwc324f3jks7rk3l92pnwaejudqld7fd7av4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqgjcdsr',
      'addr_test1qqnyelt52fx7hfwdxllzltxqm7w0mujeqyxd6sdn54wv9q4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqa4a5d2',
      'addr_test1qzgq85e5pxxfalhl3cwgqtx5kz7ty07v48vq84s5hqnmvh9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxtzu3g',
      'addr_test1qqlaazx0yjesc53t2jyx0uqu6ff6us73kyudw6ngm9pt4w4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhquy5zgs',
      'addr_test1qrqtkr7yup3v7dp4xenv25409xw7d8fdsduq4xr2vkk9699v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqnfjtgc',
      'addr_test1qpdytzqj55fyzyk03cv68ew2c4gn4kcwwsxzzkjul8p95qdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqv2qmay',
      'addr_test1qpg6gcalgz0q9k4z7e6p9n35g885yfmf54qxx6ls9ht0k69v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqm22vj3',
      'addr_test1qrqwl7ls65l0tp4z2gy3l0x6e2pf0dwkxdjs5c78d3xrtvdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq00znks',
      'addr_test1qrcszhckxswkmkxnnw4zx65cwdc4j0hyhak0sp9573hc7wav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq0fxsh9',
      'addr_test1qz8kzfhuj4cvzv82mf74en57k5a0g20y4f6z7qy5v983dvav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrjc6cy',
      'addr_test1qz50hu98dg4z84ceaefpeqhzsjnutp08lhq97tkcguk86g9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq67rjrp',
      'addr_test1qrjhqxz0ehf9yty55x4lf6nsyqpusrka4cnphnp9q9u0h69v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqwztagr',
      'addr_test1qrhe5rv3s207rxd58turses75m6nqfl6vgstt9azu93sg09v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqeu3eu8',
      'addr_test1qq0x8w4j2frws6vjzke76r3xzmafry5jaxnx8npd3f04dr9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmr8u2k',
      'addr_test1qrlgkvenyak8qpl0qvlkdyk6fs8r2735w5u520t77rlj6x9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7mnuug',
      'addr_test1qpsedmepas2n9le9thgc85e7f20n0npmzvfsxg35e6mae54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq9uyw94',
      'addr_test1qqxhdquak45cuvp70kzn99y3djfddn9jv6ddwdjaxdjc3ndv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq3vtnm2',
      'addr_test1qqt0q7d6xe5523yja6hys7smu0awmvn5k05ctwt75pc80y9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzfcd74',
      'addr_test1qqy39ct5a02r056t8t3fe67he9he4a27gadl2gcsldq4g04v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqpy54pk',
      'addr_test1qplrrursyz4kgqk6qhx2ktjxylvgewfrt656hnxdj7z2padv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq8cp7xq',
      'addr_test1qrgfq6wcysnerc3x6rz4gc7sn8lfkn3z03yu0sp2snverzdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq90f4xh',
      'addr_test1qqzkq7rhkueteg7akm4xvkdjpdecy8tdm0tddn0gtzurcq9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqf49vd5',
      'addr_test1qql6g5askp3u846w89g2h89wpfrznvecaukjefgg0srr88dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq5akmcr',
      'addr_test1qqxvxxhm48td363tqnw9p0udfg4hltl764gf9araxpzpvg9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq49e4vr',
      'addr_test1qrfe3czggk9upm82e7ps57sy0zmn47mm5n7l3zk8gq589lav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq4mdjmv',
      'addr_test1qrsv9l9cqfqs4hs6uele5myem6t56jvdaln97x64e8lt2qav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqche4wu',
      'addr_test1qq568uzwlea0v94t83en0hq8f5vaknclvfan866htjaq3tav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxwsy2u',
      'addr_test1qz4rulaxjgk50lwqcewv7ymve3eeqzspze54zss3gv24z59v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvsm8cd',
      'addr_test1qr9dhqk00xvf34p6s3pjrceeqapemstuvlv46ludqag4534v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6an00u',
      'addr_test1qpap2q3gnlvrvl2yxetwelvr8qxsnnknktq9nz4sew4gw2dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqfgfzcp',
      'addr_test1qzenxkp92wvym9vwaqdaltvewvhalqns3kh3tzskz3zpfqdv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqma48an',
      'addr_test1qrxmcf86m4epkk80syjjcem30zzkt87vfkyu4fw7elcfva9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq6dq5v6',
      'addr_test1qrxgferpjz2s98n69u9dsud8w4tt8tr6mth88yt5wnn5n89v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqmw5atm',
      'addr_test1qqv8uf7n9e4agafzh4j868d3yrggxc6zsntkr0xtca266h9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqtr2vxn',
      'addr_test1qz6e38xqrqwculaerp7gta853hgse20t997j73ewx366484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqymwgy6',
      'addr_test1qqcynhjzyncnktnqsqps0wrd90rd8uc6twy8m0h7pxgrm8dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqc83xn4',
      'addr_test1qpekhmwdqzsfdjf6x5vd9hjt3wcsygpajc58d4d80a0mj9dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhq7fe0gh',
      'addr_test1qrdtyx8cwhwx853wr0akuz6hl59umqvp8csfxeyzdf57jf4v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqfhfem6',
      'addr_test1qpuzm8wxk304qymq0kmwet3ctzda9mnjsc0qxw2gsvcwg69v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqrl5kwh',
      'addr_test1qrp7evkmertma3egamtaw33dztcvm25efxzfalahra5ct54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqg3fkgh',
      'addr_test1qzclv9vzete3jnn44x9pxkqjernhu3rghmfjejmpmuxjlddv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqvdvzjd',
      'addr_test1qq4twgd4lll02rzwshgttd9f8a5m0m70t04rtk0j4cstm2dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhquf0w92',
      'addr_test1qqjp8l6mdc0uedglu645fauel936vye4xas7l4na8u4393dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqs6e5pl',
      'addr_test1qprsdz6pt58q85c5f2z08s57wapvzhlyhdedlcxjzdhtdm9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqtqxa2w',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
      walletImplementationId: 'haskell-shelley',
      type: 'External',
    },
  },
  networkId: 300,
  walletImplementationId: 'haskell-shelley',
  isHW: false,
  hwDeviceInfo: null,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  provider: '',
}
