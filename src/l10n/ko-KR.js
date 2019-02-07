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
  russian: 'Russian',
}

const datetime = {
  today: '오늘',
  yesterday: '어제',
}

const walletNameErrors = {
  tooLong: '지갑명은 40자를 초과할 수 없습니다',
  nameAlreadyTaken: '이미 사용하고 있는 지갑명입니다.',
 
}

// common translations shared across multiple places
const common = {
  ok: 'OK',
  availableFunds: '사용 가능한 금액',
  pleaseWait: '잠시 기다려 주십시오 ...',
}

// ios system translations
const ios = {
  NSFaceIDUsageDescription:
    'Face ID를 사용하여 보다 안전하고 간편하게 계좌에 엑세스 하는게 가능합니다.',
  NSCameraUsageDescription: '카메라를 사용하여 QR코드를 스캔할 수 있습니다.',
}

const l10n = {
  global: {
    languages,
    datetime,
    ios,
    notifications: {
      offline: '현재 오프라인 상태입니다. 디바이스 설정을 확인해 주세요.',
    },
    currentLanguageName: '한국어',
  },
  confirmationDialogs: {
    logout: {
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      yesButton: '네',
      noButton: '아니오',
    },
  },
  errorDialogs: {
    generalError: (message: string) => ({
      title: '오류가 발생했습니다',
      message: `요청한 작업을 수행하지 못했습니다. 아래와 같은 오류가 발생했습니다: ${message}`,
      yesButton: common.ok,
    }),
    pinMismatch: {
      title: '유효하지 않는 PIN',
      message: 'PIN가 일치하지 않습니다.',
      yesButton: common.ok,
    },
    incorrectPin: {
      title: '유효하지 않는 PIN',
      message: '입력하신 PIN가 올바르지 않습니다.',
      yesButton: common.ok,
    },
    incorrectPassword: {
      title: '잘못된 비밀번호',
      message: '비밀번호가 올바르지 않습니다.',
      yesButton: common.ok,
    },
    biometricsIsTurnedOff: {
      title: '생체인식이 비활성화 되어 있습니다',
      message: '생체인식 기능이 현재 비활성화 되어 있으므로 활성화 시켜 주십시오.',
      yesButton: common.ok,
    },
    walletKeysInvalidated: {
      title: '생체인식 활성화',
      message:
        '스마트폰의 생체인식 변경이 탐지되었습니다. ' +
        '따라서 생체인식에 의한 간편거래 승인은 사용할 수 없게 되었으며. ' +
        '마스터 비밀번호를 이용한 거래 승인만 허용됩니다. ' +
        '설정에서 간편결제 승인을 재설정 할 수 있습니다.',
      yesButton: 'OK',
    },
    networkError: {
      title: '네트워크 오류',
      message:
        '서버에 접속하는데 문제가 발생했습니다. ' +
        '인터넷이 연결되어 있는지 확인해 주십시오.',
      yesButton: common.ok,
    },
    disableEasyConfirmationFirst: {
      title: '조치 실패',
      message:
        '우선 지갑내의 모든 간편 승인 기능을 비활성화 ' +
        해주십시오
      yesButton: common.ok,
    },
    enableFingerprintsFirst: {
      title: '조치 실패',
      message:
        '생체인식을 어플리케이션과 연동하기 위해서는, 우선 장치내의 생체인식 ' +
        '기능이 활성화 되어야 합니다',
      yesButton: 'OK',
    },
    enableSystemAuthFirst: {
      title: '화면 잠금 해제',
      message:
        '스마트폰의 화면 잠금 기능이 비활성화 되어 있는 경우, 우선 간편거래 승인을 ' +
        '비활성화 해야 합니다. 사용하고 있는 스마트폰에 ' +
        '화면 잠금 기능 (PIN / 비밀번호 / 패턴) 을 설정하고 ' +
        '어플케이션을 다시 시작해 주십시오. 그 후 스마트폰의 ' +
        '화면 잠금을 해제하고' +
        '어플리케이션을 이용할 수 있습니다.'
      yesButton: 'OK',
    },
    wrongPinError: {
      title: '유효하지 않는 PIN',
      message: 'PIN 이 잘못되었습니다.',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    continueButton: '언어를 선택해 주십시오',
  },
  YoroiDescription: {
    line1: '요로이는 카르다노를 위한 웹 기반의 라이트 월렛입니다.',
    line2: 'Secure Fast Simple',
    byEmurgo: 'By',
  },
  AppStartScreen: {
    loginButton: '로그인',
  },
  WithPinLoginScreen: {
    title: 'PIN 입력',
  },
  CreateWalletScreen: {
    title: '새로운 지갑 만들기',
  },
  CreateOrRestoreWalletScreen: {
    title: '지갑 추가하기',
    createWalletButton: '새로운 지갑 만들기',
    restoreWalletButton: '백업에서 지갑 복원하기',
  },
  // On CreateWalletScreen
  MnemonicExplanationModal: {
    paragraph1: [
      inline([
        normal(
          '다음 화면에 무작위로 선정된 15개의 단어가 나타납니다. ',
        ),
        normal('이것은 당신의 '),
        bold('지갑을 복구할 때 사용되는 구절 입니다. '),
        normal('이 구절은 요로의 지갑의 모든 버전에서 '),
        normal('사용자의 자금이나 개인키를 '),
        normal('복구하는데 사용됩니다.'),
      ]),
    ],
    paragraph2: [
      inline([
        normal('다른 사람에게 '),
        bold('노출 되지 않도록 '),
        normal('화면을 잘 가려서 사용해 주십시오.'),
      ]),
    ],
    nextButton: '내용을 확인했습니다',
  },
  WalletNameAndPasswordForm: {
    walletNameInput: {
      label: '지갑명',
      errors: walletNameErrors,
    },
    newPasswordInput: {
      label: '지갑 비밀번호',
    },
    repeatPasswordInput: {
      label: '비밀번호 재입력',
      errors: {
        passwordsDoNotMatch: '비밀번호가 일치하지 않습니다',
      },
    },
    continueButton: '계속',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: '비밀번호는 다음 요건을 충족하여야 합니다:',
    passwordMinLength: '7개의 문자',
    passwordUpperChar: '1개의 대문자',
    passwordLowerChar: '1개의 소문자',
    passwordNumber: '1개의 숫자',
    continueButton: '계속',
    passwordBigLength: '12개의 문자',
    or: '또는',
  },
  TransactionHistoryScreeen: {
    syncErrorBanner: {
      textWithoutRefresh: '동기화 문제가 발생하였습니다.',
      textWithRefresh:
        '동기화 문제가 발생하였습니다. 새로고침 해주십시오',
    },
    availableFundsBanner: {
      label: common.availableFunds,
    },
    noTransactions: '아직 거래내역이 없습니다',
    transaction: {
      transactionType: {
        SENT: '보낸 ADA',
        RECEIVED: '받은 ADA',
        SELF: 'Intrawallet',
        MULTI: 'Multiparty',
      },
      assuranceLevelHeader: '보증 등급:',
      assuranceLevel: {
        LOW: '낮음',
        MEDIUM: '중간',
        HIGH: '높음',
        PENDING: '보류',
        FAILED: '실패',
      },
      fee: '요금:',
    },
    sendButton: '보내기',
    receiveButton: '받기',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: '보낸 금액',
      RECEIVED: '받은 금액',
      SELF: 'Intrawallet transaction',
      MULTI: 'Multi-party transaction',
    },
    fee: '수수료: ',
    fromAddresses: '보내진 주소',
    toAddresses: '보낸 주소',
    transactionId: '거래 ID',
    txAssuranceLevel: '거래 보증 등급',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'CONFIRMATION', 'CONFIRMATIONS')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} omitted`,
    addressPrefix: {
      receive: (idx: number) => `/${idx}`,
      change: (idx: number) => '/change',
      notMine: 'not mine',
    },
  },
  SendAdaScreen: {
    title: '보내기',
    fee: {
      label: '수수료',
      notAvailable: '-',
    },
    balanceAfter: {
      label: '거래 후 잔액',
      notAvailable: '-',
    },
    availableFundsBanner: {
      label: common.availableFunds,
      isFetching: '잔액을 확인중입니다...',
      notAvailable: '-',
    },
    addressInput: {
      label: '주소',
      errors: {
        invalidAddress: '유효한 주소를 입력해 주십시오',
      },
    },
    amountInput: {
      label: '금액',
      errors: {
        invalidAmount: {
          // Note(ppershing): first two should be auto-corrected
          // by the input control
          INVALID_AMOUNT: '유효한 금액을 입력해 주십시오',
          TOO_MANY_DECIMAL_PLACES: '유효한 금액을 입력해 주십시오',

          TOO_LARGE: '금액 초과',
          NEGATIVE: '금액은 양수여야 합니다',
        },
        insufficientBalance: '거래를 위한 금액이 부족합니다',
      },
    },
    continueButton: '계속',
    errorBanners: {
      // note: offline banner is shared with TransactionHistory
      networkError:
        '잔액을 가져오는데 문제가 발생했습니다. ' +
        '다시 시도해 주십시오.',
      pendingOutgoingTransaction:
        '현재 보류중인 거래가 있을 경우 ' +
        '새로운 거래를 진행할 수 없습니다',
    },
  },
  ReadQRCodeAddressScreen: {
    title: 'QR 코드 주소 스캔',
  },
  ConfirmSendAdaScreen: {
    title: '보내기',
    amount: '금액',
    availableFundsBanner: {
      label: common.availableFunds,
    },
    balanceAfterTx: '거래 후 잔액',
    fees: '수수료',
    password: '지갑 비밀번호',
    receiver: '수취인',
    confirmButton: '확인',
    sendingModalTitle: '거래 제출',
    pleaseWait: common.pleaseWait,
  },
  WalletCredentialsScreen: {
    title: '지갑 자격증명',
  },
  ChangeWalletNameScreen: {
    title: '지갑명 변경',
    walletNameInput: {
      label: '지갑명',
      errors: walletNameErrors,
    },
    changeButton: '이름 변경',
  },
  ReceiveScreen: {
    title: '받기',
    infoText:
      '송금을 받기위해서는 이 주소를 공유해 주십시오. ' +
      '개인정보를 보호하기 위하여  ' +
      '새로운 주소가 매번 자동생성됩니다.',
    generateButton: '새로운 주소 생성하기',
    cannotGenerate: '기존의 주소들 중 하나를 사용해야 합니다.',
    freshAddresses: '주소 새로고침',
    usedAddresses: '이미 사용된 주소',
  },
  AddressDetailsModal: {
    walletAddress: '당신의 지갑 주소',
    BIP32path: 'BIP32 path:',
    copyLabel: '주소 복사하기',
    copiedLabel: '복사완료',
  },
  MnemonicShowScreen: {
    title: '복구 구절',
    mnemonicNote:
      '지갑의 복구구절은 반드시 다른곳에 안전하게 ' +
      '기록해 두십시오. ' +
      '복구 구절은 지갑을 사용하고 복구하는데 필요하며 ' +
      '대소문자를 구분해야 합니다.',
    confirmationButton: '확인',
  },
  MnemonicBackupImportanceModal: {
    title: '복구 구절',
    keysStorageCheckbox:
      '본인은 사용자의 비밀키가 회사 서버가 아닌 개인 장치에 ' +
      '안전하게 보관되는 것을 이해하였습니다',
    newDeviceRecoveryCheckbox:
      '본인은 해당 어플리케이션이 다른 장치로 이동되거나 ' +
      '삭제되었을 경우, 계좌의 복원은 복구 구절을 ' +
      '이용해서만 복원이 가능하다는 것을 이해하였습니다.',
    confirmationButton: '확인',
  },
  MnemonicCheckScreen: {
    title: '복구 구절',
    instructions:
      '복구 구절을 인증하려면 각 단어를 정확한 순서대로 나열해 주십시오',
    mnemonicWordsInput: {
      label: '복구 구절',
      errors: {
        invalidPhrase: '복구 구절이 일치하지 않습니다',
      },
    },
    clearButton: '지우기',
    confirmButton: '확인',
  },
  RestoreWalletScreen: {
    title: '지갑 복구',
    instructions:
      '지갑을 복구하기 위하여 최초 지갑 생성시 받은 복구 구절을 ' +
      '입력하여 주십시오.',
    mnemonicInput: {
      label: '복구 구절',
      errors: {
        TOO_LONG: '구절이 너무 깁니다. ',
        TOO_SHORT: '구절이 너무 짧습니다. ',
        INVALID_CHECKSUM: '유효한 부호를 입력해 주십시오.',
        UNKNOWN_WORDS: (words: Array<string>) => {
          const wordlist = words.map((word) => `'${word}'`).join(', ')
          const areInvalid = `${pluralizeEn(words.length, 'is', 'are')} invalid`
          return `${wordlist} ${areInvalid}`
        },
      },
    },
    restoreButton: '지갑 복구',
  },
  SettingsScreen: {
    WalletTab: {
      title: '설정',
      tabTitle: '지갑',

      switchWallet: '지갑 교체',
      logout: '로그아웃',

      walletName: '지갑명',

      security: '안전',
      changePassword: '비밀번호 변경',
      easyConfirmation: '간편거래 승인',

      removeWallet: '지갑 삭제',
    },
    ApplicationTab: {
      title: '설정',
      tabTitle: '어플리케이션'

      language: '언어',

      security: '안전',
      changePin: 'PIN 변경',
      biometricsSignIn: '생체인식을 이용하여 로그인',

      crashReporting: '크래쉬 레포트',
      crashReportingText:
        'EMURGO로 크래쉬 레포트 보내기. ' +
        '어플리캐이션 재작동 후 ' +
        ' 옵션 변경이 반영됩니다.',

      termsOfUse: '이용 약관',
      support: '지원',
    },
  },
  SupportScreen: {
    title: '지원',
    faq: {
      label: '자주 묻는 질문 보기',
      description:
        '문제가 발생할 경우 요로이 웹사이트에서 ' +
        'FAQ를 확인해 주십시오.',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: '문제 보고하기',
      description:
        'FAQ에서 문제가 해결되지 않은 경우에는, ' +
        '지원 요청 기능을 이용해 주십시오.',
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: '서비스 이용약관 동의서',
    content: termsOfService,
    aggreeClause: '서비스 이용약관에 동의합니다',
    continueButton: '동의',
    savingConsentModalTitle: '초기화',
    pleaseWait: common.pleaseWait,
  },
  WalletSelectionScreen: {
    header: '지갑',
    addWalletButton: '지갑 추가',
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      '우선 해당 장치에 지문인식 사용을 활성화 하십시오!',
    notNowButton: '나중에 하기',
    linkButton: '링크',
    headings: ['지문인식을 사용하여'],
    subHeadings: ['더 빠르고 간편하게', '요로이 지갑에 엑세스 하세요'],
  },
  // TODO(ppershing): this localization is a mess
  BiometricsAuthScreen: {
    authorizeOperation: '승인',
    useFallbackButton: '사용 대체',
    headings: ['지문인식을 사용하여', '승인하기'],
    cancelButton: '취소',
    errors: {
      NOT_RECOGNIZED: '지문이 인식되지 않았습니다. 다시 시도해 주십시오',
      SENSOR_LOCKOUT: '너무 많은 손가락을 사용하여 센서가 비활성화 되었습니다',
      SENSOR_LOCKOUT_PERMANENT:
        'You permanently locked out your fingerprint sensor. Use fallback.',
      DECRYPTION_FAILED: 'Fingerprint sensor failed please use fallback',
      UNKNOWN_ERROR: '알 수 없는 오류',
    },
  },
  RemoveWalletScreen: {
    title: '지갑 삭제',
    description: {
      paragraph1:
        '지갑을 영구적으로 지우길 원할 경우에는 ' +
        '반드시 복구구절을 적어 두었는지 확인해 주십시오.',
      paragraph2: 'To confirm this operation type the wallet name below.',
    },
    walletName: '지갑명',
    walletNameInput: '지갑명',
    remove: '지갑 삭제',
    hasWrittenDownMnemonic:
      '본인은 지갑의 복구 구절을 적어 두었고, 이 복구 구절이 없이는 ' +
      '지갑을 복구할 수 없다는 것을 이해합니다.',
  },

  ChoosePinScreen: {
    title: 'PIN 지정',
    PinRegistrationForm: {
      PinInput: {
        title: 'PIN 입력',
        subtitle: '신속한 엑세스를 위해 새로운 PIN을 선택.',
      },
      PinConfirmationInput: {
        title: 'PIN 재입력',
      },
    },
  },
  ChangePasswordScreen: {
    title: '비밀번호 변경',
    oldPasswordInput: {
      label: '현재 비밀번호',
    },
    newPasswordInput: {
      label: '새로운 비밀번호',
    },
    repeatPasswordInput: {
      label: '새로운 비밀번호 재입력',
      errors: {
        passwordsDoNotMatch: '비밀번호가 일치하지 않습니다',
      },
    },
    continueButton: '비밀번호 변경',
  },
  ChangeCustomPinScreen: {
    title: 'PIN 변경',
    CurrentPinInput: {
      title: 'PIN 입력',
      subtitle: '현재 사용하고 있는 PIN을 입력해 주십시오',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'PIN 입력',
        subtitle: '새로운 PIN을 선택하여 지갑에 접속하기.',
      },
      PinConfirmationInput: {
        title: 'PIN 재입력',
      },
    },
  },
  EasyConfirmationScreen: {
    title: '간편 승인',
    enable: {
      heading:
        '간편 승인은 지문인식이나 얼굴인식을 ' +
        '사용하여 지갑에서의 ADA거래를 ' +
        '승인합니다. ' +
        '이 기능은 지갑의 안전성을 약화시킵니다. UX와 안전성 ' +
        '어느쪽을 중요시 하는지에 대한 선택입니다!',
      warning:
        '장치의 생체인식 기능이 불가능하게 되는 경우에 대비하여 ' +
        '마스터 비밀번호를 반드시 기억해두시길 바랍니다.',
      masterPassword: '마스터 비밀번호',
      enableButton: '활성화',
    },
    disable: {
      heading:
        '이 옵션을 비활성화 시키면 오직 마스터 패스워드를 이용해서만 ' +
        'ADA를 거래할 수 있게 됩니다.',
      disableButton: '비활성화',
    },
  },
  Biometry: {
    approveTransaction: '지문인식으로 승인',
    subtitle: '', // subtitle for the biometry dialog Andoid 9
    description: '', // description of the biometry dialog Android 9
    cancelButton: '취소',
  },
}

export default l10n
