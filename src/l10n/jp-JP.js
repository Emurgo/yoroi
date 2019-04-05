// @flow
import {pluralizeEn, bold, normal, inline} from './util'
import {termsOfService} from './tos.en'

// Do not translate
const languages = {
  // TODO: Add back when chinese is available
  // chineseSimplified: '简体中文',
  // chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Русский',
}

const datetime = {
  today: '今日',
  yesterday: '昨日',
} 


const walletNameErrors = {
  tooLong: 'ウォレット名が40文字を超えています',
  nameAlreadyTaken: '同じ名前のウォレットが存在します',
}

// common translations shared across multiple places
const common = {
  ok: 'OK',
  availableFunds: '利用可能な資金',
  pleaseWait: 'お待ちください....',
}

// ios system translations
const ios = {
  NSFaceIDUsageDescription:
    'FaceIDを使えば、より安全・簡単にアカウントにアクセスすることができます。',
  NSCameraUsageDescription: 'カメラを使って、QRコードを読み取ることができます。',
}

const l10n = {
  global: {
    languages,
    datetime,
    ios,
    notifications: {
      offline: 'オフラインになっています。 デバイスの設定を確認してください。',
    },
    currentLanguageName: '日本語',
  },
  confirmationDialogs: {
    logout: {
      title: 'ログアウト',
      message: 'ログアウトしますか?',
      yesButton: 'はい',
      noButton: 'いいえ',
    },
  },
  errorDialogs: {
    generalError: (message: string) => ({
      title: '予期せぬエラーが発生しました',
      message: `要求された操作を行うことができません。 エラー内容: ${message}`,
      yesButton: common.ok,
    }),
    pinMismatch: {
      title: 'PINが無効です',
      message: 'PINが一致していません',
      yesButton: common.ok,
    },
    incorrectPin: {
      title: 'PINが無効です',
      message: '入力したPINが間違っています。',
      yesButton: common.ok,
    },
    incorrectPassword: {
      title: 'パスワードエラー',
      message: '入力したパスワードが間違っています。',
      yesButton: common.ok,
    },
    biometricsIsTurnedOff: {
      title: ' 生体認証機能エラー',
      message: '生体認証機能が無効になっています。生体認証を有効に設定してください',
      yesButton: common.ok,
    },
    walletKeysInvalidated: {
      title: '生体認証が変更されました',
      message:
        ' 端末で生体認証の変更が検出されました。 ' +
        'これにより簡易トランザクション承認が無効になりました' +
        'トランザクションはマスターパスワードによってのみ承認されます。 ' +
        '設定で簡易トランザクション承認を有効にできます',
      yesButton: 'OK',
    },
    networkError: {
      title: 'ネットワークエラー',
      message:
        'サーバーに接続できません。 ' +
        'インターネットの接続を確認してください',
      yesButton: common.ok,
    },
    disableEasyConfirmationFirst: {
      title: 'アクションが失敗しました。',
      message:
        'すべてのウォレットの簡易トランザクション承認を ' +
        '無効にしてください',
      yesButton: common.ok,
    },
    enableFingerprintsFirst: {
      title: 'アクションが失敗しました',
      message:
        ' このアプリとリンクさせるために ' +
        'デバイスの生体認証を有効にしてください',
      yesButton: 'OK',
    },
    enableSystemAuthFirst: {
      title: 'ロック画面が無効です',
      message:
        '端末のロック画面を無効に設定していませんか？ あらかじめ' +
        '簡易トランザクション承認を無効に設定する必要があります。 ' +
        '端末のロック画面を設定し（PIN、パスワード、パターン)、' +
        'デバイスを再起動してください。 その後ロック画面を無効に設定し ' +
        '本アプリをご利用いただけます' +
        '',
      yesButton: 'OK',
    },
    wrongPinError: {
      title: 'PINが無効です',
      メッセージ: '入力したPIN が間違っています ',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    continueButton: '言語を選んでください',
  },
  YoroiDescription: {
    line1: 'ヨロイは、Cardanoのためのライトウォレットです',
    line2: '安全で、はやくて、シンプル',
    byEmurgo: 'By',
  },
  AppStartScreen: {
    loginButton: 'ログイン',
  },
  WithPinLoginScreen: {
    title: 'PINを入れてください',
  },
  CreateWalletScreen: {
    title: '新しいウォレットを作成',
  },
  CreateOrRestoreWalletScreen: {
    title: 'ウォレットを追加',
    createWalletButton: '新しいウォレットを作成',
    restoreWalletButton: 'ウォレットの復元',
  },
  // On CreateWalletScreen
  MnemonicExplanationModal: {
    paragraph1: [
      inline([
        normal(
          '次の画面で、任意の15個の言葉が表示されます。 ',
        ),
        normal('これはあなたの '),
        bold('ウォレットの復元フレーズです。 '),
        normal('ヨロイのどのバージョンでも、'),
        normal('入力して、ウォレットと秘密鍵を'),
        normal('復元できます。'),
      ]),
    ],
    paragraph2: [
      inline([
        normal('不正アクセスを'),
        bold('防止するために、'),
        normal('誰も画面をのぞいていないことを確認してください。'),
      ]),
    ],
    nextButton: '了解',
  },
  WalletNameAndPasswordForm: {
    walletNameInput: {
      label: 'ウォレット名',
      errors: walletNameErrors,
    },
    newPasswordInput: {
      label: 'ウォレットのパスワード',
    },
    repeatPasswordInput: {
      label: 'パスワードをもう一度入力',
      errors: {
        passwordsDoNotMatch: 'パスワードが一致していません',
      },
    },
    continueButton: '続行',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: 'パスワードの必須条件:',
    passwordMinLength: '7文字',
    passwordUpperChar: '大文字',
    passwordLowerChar: '小文字',
    passwordNumber: '1数字',
    continueButton: '続行',
    passwordBigLength: '12文字',
    or: 'または',
  },
  TransactionHistoryScreeen: {
    syncErrorBanner: {
      textWithoutRefresh: '同期エラーが発生しています。',
      textWithRefresh:
        '同期エラーが発生しています。 再読み込みをしてください',
    },
    availableFundsBanner: {
      label: common.availableFunds,
    },
    noTransactions: 'トランザクションがありません',
    transaction: {
      transactionType: {
        SENT: 'ADAが送信されました',
        RECEIVED: 'ADAを受信しました',
        SELF: 'ウォレット内',
        MULTI: '複数人',
      },
      assuranceLevelHeader: '確信度',
      assuranceLevel: {
        LOW: '低度',
        MEDIUM: '中度',
        HIGH: '高度',
        PENDING: '保留',
        FAILED: '失敗しました',
      },
      fee: '手数料:',
    },
    sendButton: '送信',
    receiveButton: '受信',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: '資金を送信しました',
      RECEIVED: '資金を受信しました',
      SELF: 'ウォレット内トランザクション',
      MULTI: '複数人とのトランザクション',
    },
    fee: '手数料: ',
    fromAddresses: 'アドレスから',
    toAddresses: 'アドレスへ',
    transactionId: 'トランザクションID',
    txAssuranceLevel: 'トランザクション確信度',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, '承認', '承認')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} 省略`,
    addressPrefix: {
      receive: (idx: number) => `/${idx}`,
      change: (idx: number) => '/おつり',
      notMine: '他人',
    },
  },
  SendAdaScreen: {
    title: '送信',
    fee: {
      label: '手数料',
      notAvailable: '-',
    },
    balanceAfter: {
      label: 'その後の残高',
      notAvailable: '-',
    },
    availableFundsBanner: {
      label: common.availableFunds,
      isFetching: '残高を確認しています...',
      notAvailable: '-',
    },
    addressInput: {
      label: 'アドレス',
      errors: {
        invalidAddress: '有効なアドレスを入力してください',
      },
    },
    amountInput: {
      label: '数',
      errors: {
        invalidAmount: {
          // Note(ppershing): first two should be auto-corrected
          // by the input control
          INVALID_AMOUNT: '有効な数を入れてください。',
          TOO_MANY_DECIMAL_PLACES: '有効な数を入力してください',

          TOO_LARGE: '数が大きすぎます',
          NEGATIVE: '正の数を入力してください',
        },
        insufficientBalance: '残高が不足しています',
      },
    },
    continueButton: '続行',
    errorBanners: {
      // note: offline banner is shared with TransactionHistory
      networkError:
        '残高を表示できません。 ' +
        'クリックして再試行',
      pendingOutgoingTransaction:
        '既存のトランザクションが進行中の時は、 ' +
        '新しいトランザクションを行えません',
    },
  },
  ReadQRCodeAddressScreen: {
    title: 'QRコードアドレスをスキャンしてください',
  },
  ConfirmSendAdaScreen: {
    title: '送信',
    amount: '数',
    availableFundsBanner: {
      label: common.availableFunds,
    },
    balanceAfterTx: 'トランザクション後の残高',
    fees: '手数料',
    password: 'ウォレットのパスワード',
    receiver: '受信者',
    confirmButton: '承認',
    sendingModalTitle: 'トランザクションの承認',
    pleaseWait: common.pleaseWait,
  },
  WalletCredentialsScreen: {
    title: 'ウォレット情報',
  },
  ChangeWalletNameScreen: {
    title: 'ウォレット名を変更する',
    walletNameInput: {
      label: 'ウォレット名',
      errors: walletNameErrors,
    },
    changeButton: '名前を変更する',
  },
  ReceiveScreen: {
    title: '受信',
    infoText:
      'このアドレスを共有して、支払いを受けることができます。 ' +
      'プライバシー保護のため、 ' +
      '新しいアドレスが毎回自動生成されます。',
    generateButton: '他のアドレスを生成する',
    cannotGenerate: 'アドレスをいくつか使用する必要があります',
    freshAddresses: '新しいアドレス',
    usedAddresses: '使用されたアドレス',
  },
  AddressDetailsModal: {
    walletAddress: 'あなたのウォレットのアドレス',
    BIP32path: 'BIP32 path:',
    copyLabel: 'アドレスをコピーする',
    copiedLabel: 'コピーされました',
  },
  MnemonicShowScreen: {
    title: '復元フレーズ',
    mnemonicNote:
      'この復元フレーズは、どこか安全なところに ' +
      '必ず書き留めてください。 ' +
      'ウォレットの使用及び復元には、復元フレーズが必要です。 ' +
      ' フレーズの大文字小文字を区別してください。',
    confirmationButton: '復元フレーズを書き留めました',
  },
  MnemonicBackupImportanceModal: {
    title: '復元フレーズ',
    keysStorageCheckbox:
      '秘密鍵は、会社のサーバーではなく、' +
      'このデバイス上にのみ保存されることを理解しました',
    newDeviceRecoveryCheckbox:
      'アプリを別のデバイスに移動させたり、消去した場合、 ' +
      '復元フレーズがないと資金が復元されないことを ' +
      '理解しました。',
    confirmationButton: 'はい',
  },
  MnemonicCheckScreen: {
    title: '復元フレーズ',
    instructions:
      '正しい順序でワードをタップして、復元フレーズを有効化してください',

    mnemonicWordsInput: {
      label: '復元フレーズ',
      errors: {
        invalidPhrase: '復元フレーズが間違っています',
      },
    },
    clearButton: '全消去',
    confirmButton: '承認',
  },
  RestoreWalletScreen: {
    title: 'ウォレットの復元',
    instructions:
      'ウォレットの復元には、復元フレーズが必要です。' +
      '復元フレーズは、最初にウォレットを作成した時に表示されたものです。',
 
     mnemonicInput: {
      label: '復元フレーズ',
      errors: {
        TOO_LONG: 'フレーズが長すぎます。 ',
        TOO_SHORT: 'フレーズが短すぎます。 ',
        INVALID_CHECKSUM: '有効な復元フレーズを入力してください。',
        UNKNOWN_WORDS: (words: Array<string>) => {
          const wordlist = words.map((word) => `'${word}'`).join(', ')
          const areInvalid = `${pluralizeEn(words.length, 'は', 'は')} 無効です`
          return `${wordlist} ${areInvalid}`
        },
      },
    },
    restoreButton: 'ウォレットの復元',
  },
  SettingsScreen: {
    WalletTab: {
      title: '設定',
      tabTitle: 'ウォレット',

      switchWallet: 'ウォレットを変える',
      logout: 'ログアウト',

      walletName: 'ウォレット名',

      security: 'セキュリティ',
      changePassword: 'パスワードを変更する ',
      easyConfirmation: '簡易トランザクション承認',

      removeWallet: 'ウォレットを消去',
    },
    ApplicationTab: {
      title: '設定',
      tabTitle: 'アプリケーション',

      language: '言語',

      security: 'セキュリティ',
      changePin: 'PINを変える',
      biometricsSignIn: '生体認証を使ってサインイン',

      crashReporting: 'クラッシュ報告',
      crashReportingText:
        'Emurgoにクラッシュレポートを送る。 ' +
        'このオプションの変更は、アプリケーションの ' +
        ' 再起動後に反映されます。',

      termsOfUse: '利用規約',
      support: 'サポート',
    },
  },
  SupportScreen: {
    title: 'サポート',
    faq: {
      label: 'よくある質問を見る',
      description:
        '問題が起こりましたら、ヨロイウェブサイトのFAQ ' +
        'をご参照ください。',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: '問題を報告する',
      description:
        'FAQで問題が解決しない場合は、 ' +
        'サポートリクエストを利用してください。',
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: '契約条件',
    content: termsOfService,
    aggreeClause: '契約に同意します',
    continueButton: '同意',
    savingConsentModalTitle: '初期化',
    pleaseWait: common.pleaseWait,
  },
  WalletSelectionScreen: {
    header: 'あなたのウォレット',
    addWalletButton: 'ウォレットを追加する',
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      '設定で指紋認証を有効にしてください。',
    notNowButton: '後で行う',
    linkButton: 'リンク',
    headings: ['指紋認証を使用して、'],
    subHeadings: ['より安全に早く', 'ウォレットにアクセス'],
  },
  // TODO(ppershing): this localization is a mess
  BiometricsAuthScreen: {
    authorizeOperation: 'オペレーションの権限を委任する',
    useFallbackButton: '戻る',
    headings: ['指紋認証を', '承認する'],
    cancelButton: 'キャンセル',
    errors: {
      NOT_RECOGNIZED: '指紋認証を認識できません。再試行してください',
      SENSOR_LOCKOUT: '同時に認識できる指は１本までです。センサーが無効になりました',
      SENSOR_LOCKOUT_PERMANENT:
        '指紋認証が無効のようです。. 従来の方法を使ってください。.',
      DECRYPTION_FAILED: '指紋認証に失敗しました。一度戻ってください',
      UNKNOWN_ERROR: '不明のエラー',
    },
  },
  RemoveWalletScreen: {
    title: 'ウォレットを消去',
    description: {
      paragraph1:
        'ウォレットを完全に消去したい場合は、' +
        '復元フレーズを保持していることを確認してください。',
      paragraph2: '操作を承認するために、ウォレット名を下にタイプしてください。',
    },
    walletName: 'ウォレット名',
    walletNameInput: 'ウォレット名',
    removeWallet: 'ウォレットを消去',
    hasWrittenDownMnemonic:
      '復元フレーズを書き留め、これがないとウォレットを復元 ' +
      'できないことを理解しました。',
  },

  ChoosePinScreen: {
    title: 'PINを設定する',
    PinRegistrationForm: {
      PinInput: {
        title: 'PINを入力する',
        subtitle: '新しいPINを選んで、クイックアクセスを有効にします',
      },
      PinConfirmationInput: {
        title: 'PINをもう一度入力',
      },
    },
  },
  ChangePasswordScreen: {
    title: 'ウォレットのパスワードを変更する',
    oldPasswordInput: {
      label: '現在のパスワード',
    },
    newPasswordInput: {
      label: '新しいパスワード',
    },
    repeatPasswordInput: {
      label: '新パスワードをもう一度入力',
      errors: {
        passwordsDoNotMatch: 'パスワードが一致していません',
      },
    },
    continueButton: 'パスワードを変更する',
  },
  ChangeCustomPinScreen: {
    title: 'PINを変更する',
    CurrentPinInput: {
      title: 'PINを入れてください',
      subtitle: '現在のPINを入れてください',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'PINを入れてください',
        subtitle: '新しいPINを選んで、クイックアクセスを有効にする。',
      },
      PinConfirmationInput: {
        title: 'PINもう一度入力',
      },
    },
  },
  EasyConfirmationScreen: {
    title: '簡易トランザクション承認',
    enable: {
      heading:
        '簡易トランザクション承認とは、指紋認証や顔認証 ' +
        'を用いて、ADAのトランザクションを行うものです。' +
        ' ' +
        'これによってセキュリティが弱くなります。 セキュリティと使いやすさ' +

        'どっちを重要視するかという選択になります。',
      warning:
        'あなたのマスターパスワードは、 ' +
        '生体認証データがデバイスから消えた場合に必要です。',
      masterPassword: 'マスターパスワード',
      enableButton: '有効にする',
    },
    disable: {
      heading:
        '生体認証を無効にすると、マスターパスワードによってのみ ' +
        'ADAを送信できます。',
      disableButton: '無効にする',
    },
  },
  Biometry: {
    approveTransaction: '指紋認証を許可する',
    subtitle: '', // subtitle for the biometry dialog Andoid 9
    description: '', // description of the biometry dialog Android 9
    cancelButton: 'キャンセル',
  },
}

export default l10n
