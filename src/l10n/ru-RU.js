// @flow
import {pluralizeEn, bold, normal, inline} from './util'
import {termsOfService} from './tos.en'

// Do not translate
const languages = {
  chineseSimplified: '简体中文',
  chineseTraditional: '繁體中文',
  english: 'English',
  japanese: '日本語',
  korean: '한국어',
  russian: 'Русский',
}

const datetime = {
  today: 'Сегодня',
  yesterday: 'Вчера',
}

const walletNameErrors = {
  tooLong: 'Имя кошелька не должно быть длиннее 40 символов',
  nameAlreadyTaken: 'Это имя уже занято',
}

// common translations shared across multiple places
const common = {
  ok: 'ОК',
  availableFunds: 'Доступные средства',
  pleaseWait: 'пожалуйста, подождите ...',
}

// ios system translations
const ios = {
  NSFaceIDUsageDescription:
    'Активация Face ID позволяет Вам быстро и безопасно получить доступ к Вашему аккаунту.',
  NSCameraUsageDescription: 'Включение камеры позволяет Вам сканировать QR коды.',
}

const l10n = {
  global: {
    languages,
    datetime,
    ios,
    notifications: {
      offline: 'Вы не подключены к сети. Пожалуйста, проверьте настройки на Вашем устройстве.',
    },
    currentLanguageName: 'Русский',
  },
  confirmationDialogs: {
    logout: {
      title: 'Выйти',
      message: 'Вы действительно хотите завершить сеанс?',
      yesButton: 'Да',
      noButton: 'Нет',
    },
  },
  errorDialogs: {
    generalError: (message: string) => ({
      title: 'Непредвиденная ошибка',
      message: `Не удалось выполнить запрошенную операцию. Это все, что нам известно: ${message}`,
      yesButton: common.ok,
    }),
    pinMismatch: {
      title: 'Неверный PIN',
      message: 'PIN-коды не совпадают.',
      yesButton: common.ok,
    },
    incorrectPin: {
      title: 'Неверный PIN',
      message: 'Вы ввели неверный PIN-код.',
      yesButton: common.ok,
    },
    incorrectPassword: {
      title: 'Неверный пароль',
      message: 'Вы ввели неверный пароль.',
      yesButton: common.ok,
    },
    biometricsIsTurnedOff: {
      title: 'Биометрия была выключена',
      message: 'Кажется, что Вы отключили биометрию, пожалуйста, включите её',
      yesButton: common.ok,
    },
    walletKeysInvalidated: {
      title: 'Биометрия изменена',
      message:
        'Мы обнаружили, что биометрия в Вашем телефоне изменилась. ' +
        'В результате чего упрощенное подтверждение транзакции было отключено ' +
        'и отправка транзакции разрешена только с мастер-паролем. ' +
        'Вы можете заново подключить упрощенное подтверждение транзакций в настройках ',
      yesButton: 'ОК',
    },
    networkError: {
      title: 'Ошибка сети',
      message:
        'Ошибка при подключении к серверу. ' +
        'Пожалуйста, проверьте Ваше подключение к Интернету',
      yesButton: common.ok,
    },
    disableEasyConfirmationFirst: {
      title: 'Действие не удалось',
      message:
        'Пожалуйста, сначала отключите функцию упрощенного подтверждения транзакции во всех ' +
        'своих кошельках',
      yesButton: common.ok,
    },
    enableFingerprintsFirst: {
      title: 'Действие не удалось',
      message:
        'Вам сначала необходимо включить биометрию на своем устройстве, чтобы ' +
        'чтобы иметь возможность связать её с этим приложением',
      yesButton: 'ОК',
    },
    enableSystemAuthFirst: {
      title: 'Блокировка экрана отключена',
      message:
        'Вы, вероятно, отключили блокировку экрана в Вашем телефоне. Вам необходимо ' +
        'сначала отключить упрощенное подтверждение транзакции. Пожалуйста, настройте ' +
        'экран блокировки (PIN / пароль / схема) на Вашем телефоне ' +
        'и затем перезапустите приложение. После этого Вы сможете ' +
        'отключить блокировку экрана ' +
        'на своем телефоне и пользоваться этим приложением',
      yesButton: 'OK',
    },
    wrongPinError: {
      title: 'Неверный PIN',
      message: 'неверный PIN-код.',
      yesButton: 'OK',
    },
  },
  LanguageSelectionScreen: {
    languages,
    continueButton: 'Выбрать язык',
  },
  YoroiDescription: {
    line1: 'Yoroi - это легкий веб-кошелек для Cardano',
    line2: 'Безопасно Быстро Просто',
    byEmurgo: 'От',
  },
  AppStartScreen: {
    loginButton: 'Вход',
  },
  WithPinLoginScreen: {
    title: 'Ввести PIN',
  },
  CreateWalletScreen: {
    title: 'Создать новый кошелек',
  },
  CreateOrRestoreWalletScreen: {
    title: 'Добавить кошелек',
    createWalletButton: 'Создать новый кошелек',
    restoreWalletButton: 'Восстановить кошелек из резервной копии',
  },
  // On CreateWalletScreen
  MnemonicExplanationModal: {
    paragraph1: [
      inline([
        normal(
          'В следующем окне Вы увидите набор 15 случайных слов. ',
        ),
        normal('Это восстановительная '),
        bold('фраза Вашего кошелька. '),
        normal('Она может быть введена в любой версии '),
        normal('Yoroi для резервного копирования или восстановления '),
        normal('средств Вашего кошелька и приватного ключа.'),
      ]),
    ],
    paragraph2: [
      inline([
        normal('Убедитесь, что '),
        bold('никто не смотрит на экран Вашего устройства '),
        normal('если только Вы не собираетесь предоставить им доступ к Вашим средствам.'),
      ]),
    ],
    nextButton: 'Я понимаю',
  },
  WalletNameAndPasswordForm: {
    walletNameInput: {
      label: 'Имя кошелька',
      errors: walletNameErrors,
    },
    newPasswordInput: {
      label: 'Пароль кошелька',
    },
    repeatPasswordInput: {
      label: 'Повторите пароль',
      errors: {
        passwordsDoNotMatch: 'Пароли не совпадают',
      },
    },
    continueButton: 'Продолжить',
  },
  PasswordStrengthIndicator: {
    passwordRequirementsNote: 'Пароль должен иметь не менее:',
    passwordMinLength: '7 символов',
    passwordUpperChar: '1 заглавную букву',
    passwordLowerChar: '1 строчную букву',
    passwordNumber: '1 цифру',
    continueButton: 'Продолжить',
    passwordBigLength: '12 символов',
    or: 'Или',
  },
  TransactionHistoryScreeen: {
    syncErrorBanner: {
      textWithoutRefresh: 'У нас проблемы с синхронизацией.',
      textWithRefresh:
        'У нас проблемы с синхронизацией. Потяните, чтобы обновить',
    },
    availableFundsBanner: {
      label: common.availableFunds,
    },
    noTransactions: 'Еще нет транзакций для показа',
    transaction: {
      transactionType: {
        SENT: 'отправить ADA',
        RECEIVED: 'получить ADA',
        SELF: 'Внутренний кошелек',
        MULTI: 'Смешанный',
      },
      assuranceLevelHeader: 'Уровень гарантии:',
      assuranceLevel: {
        LOW: 'Низкий',
        MEDIUM: 'Средний',
        HIGH: 'Высокий',
        PENDING: 'В ожидании',
        FAILED: 'Не удалось',
      },
      fee: 'Комиссия:',
    },
    sendButton: 'Отправить',
    receiveButton: 'Получить',
  },
  TransactionDetailsScreen: {
    transactionType: {
      SENT: 'Отправленные средства',
      RECEIVED: 'Полученные средства',
      SELF: 'Внутренняя транзакция',
      MULTI: 'Смешанная транзакция',
    },
    fee: 'Комиссия: ',
    fromAddresses: 'С адресов',
    toAddresses: 'На адреса',
    transactionId: 'ID транзакции',
    txAssuranceLevel: 'Уровень гарантии транзакции',
    formatConfirmations: (cnt: number) =>
      `${cnt} ${pluralizeEn(cnt, 'ПОДТВЕРЖДЕНИЕ', 'ПОДТВЕРЖДЕНИЯ')}`,
    formatOmittedCount: (cnt: number) => `+ ${cnt} omitted`,
    addressPrefix: {
      receive: (idx: number) => `/${idx}`,
      change: (idx: number) => '/изменить',
      notMine: 'не мое',
    },
  },
  SendAdaScreen: {
    title: 'Отправить',
    fee: {
      label: 'Комиссия',
      notAvailable: '-',
    },
    balanceAfter: {
      label: 'Баланс после',
      notAvailable: '-',
    },
    availableFundsBanner: {
      label: common.availableFunds,
      isFetching: 'Проверка баланса...',
      notAvailable: '-',
    },
    addressInput: {
      label: 'Адрес',
      errors: {
        invalidAddress: 'Пожалуйста, введите действительный адрес',
      },
    },
    amountInput: {
      label: 'Сумма',
      errors: {
        invalidAmount: {
          // Note(ppershing): first two should be auto-corrected
          // by the input control
          INVALID_AMOUNT: 'Пожалуйста, введите правильную сумму',
          TOO_MANY_DECIMAL_PLACES: 'Пожалуйста, введите правильную сумму',

          TOO_LARGE: 'Слишком большая сумма',
          NEGATIVE: 'Сумма должна быть положительной',
        },
        insufficientBalance: 'Недостаточно средств для проведения этой транзакции',
      },
    },
    continueButton: 'Продолжить',
    errorBanners: {
      // note: offline banner is shared with TransactionHistory
      networkError:
        'У нас возникли проблемы с получением текущего баланса. ' +
        'Нажмите, чтобы повторить.',
      pendingOutgoingTransaction:
        'Вы не можете отправить новую транзакцию пока ' +
        'текущая еще не завершена',
    },
  },
  ReadQRCodeAddressScreen: {
    title: 'Сканировать QR-код адреса',
  },
  ConfirmSendAdaScreen: {
    title: 'Отправить',
    amount: 'Сумма',
    availableFundsBanner: {
      label: common.availableFunds,
    },
    balanceAfterTx: 'Баланс после транзакции',
    fees: 'Комиссия',
    password: 'Пароль кошелька',
    receiver: 'Получатель',
    confirmButton: 'Подтвердить',
    sendingModalTitle: 'Отправка транзакции',
    pleaseWait: common.pleaseWait,
  },
  WalletCredentialsScreen: {
    title: 'Учетные данные кошелька',
  },
  ChangeWalletNameScreen: {
    title: 'Изменить имя кошелька',
    walletNameInput: {
      label: 'Имя кошелька',
      errors: walletNameErrors,
    },
    changeButton: 'Изменить имя',
  },
  ReceiveScreen: {
    title: 'Получить',
    infoText:
      'Поделитесь этим адресом для получения платежей. ' +
      'Для защиты Вашей конфиденциальности, новые адреса ' +
      'генерируются автоматически после того, как Вы ими воспользовались.',
    generateButton: 'Сгенерировать другой адрес',
    cannotGenerate: 'Вы должны использовать некоторые из ваших адресов',
    freshAddresses: 'Новые адреса',
    usedAddresses: 'Использованные адреса',
  },
  AddressDetailsModal: {
    walletAddress: 'Адрес Вашего кошелька',
    BIP32path: 'BIP32 путь:',
    copyLabel: 'Cкопировать адрес ',
    copiedLabel: 'Скопировано',
  },
  MnemonicShowScreen: {
    title: 'Восстановительная фраза',
    mnemonicNote:
      'Пожалуйста, убедитесь, что Вы внимательно записали ' +
      'восстановительную фразу в безопасном месте. ' +
      'Вам будет нужна эта фраза для использования и восстановления Вашего кошелька. ' +
      'Фраза чувствительна к регистру.',
    confirmationButton: 'Да, я записал фразу',
  },
  MnemonicBackupImportanceModal: {
    title: 'Восстановительная фраза',
    keysStorageCheckbox:
      'Я понимаю, что мои секретные ключи безопасным образом хранятся ' +
      'только на данном устройстве, а не на серверах компании',
    newDeviceRecoveryCheckbox:
      'Я понимаю, что если данное приложение будет перемещено на другое устройство ' +
      'или удалено, мои средства могут быть восстановлены только с помощью фразы восстановления, которую ' +
      'я записал и сохранил в безопасном месте.',
    confirmationButton: 'Я понимаю',
  },
  MnemonicCheckScreen: {
    title: 'Восстановительная фраза',
    instructions:
      'Нажмите на каждое слово в правильном порядке для проверки Вашей фразы восстановления',
    mnemonicWordsInput: {
      label: 'Восстановительная фраза',
      errors: {
        invalidPhrase: 'Восстановительная фраза не совпадает',
      },
    },
    clearButton: 'Очистить',
    confirmButton: 'Подтвердить',
  },
  RestoreWalletScreen: {
    title: 'Восстановить кошелек',
    instructions:
      'Чтобы восстановить Ваш кошелек, пожалуйста, предоставьте восстановительную фразу, которую ' +
      'Вы получили, когда создали свой кошелек в первый раз.',
    mnemonicInput: {
      label: 'Восстановительная фраза',
      errors: {
        TOO_LONG: 'Фраза слишком длинная. ',
        TOO_SHORT: 'Фраза слишком короткая. ',
        INVALID_CHECKSUM: 'Пожалуйста, введите верную мнемоническую фразу.',
        UNKNOWN_WORDS: (words: Array<string>) => {
          const wordlist = words.map((word) => `'${word}'`).join(', ')
          const areInvalid = 'недействительны'
          return `${wordlist} ${areInvalid}`
        },
      },
    },
    restoreButton: 'Восстановить кошелек',
  },
  SettingsScreen: {
    WalletTab: {
      title: 'Настройки',
      tabTitle: 'Кошелек',

      switchWallet: 'Перейти в другой кошелек',
      logout: 'Выход',

      walletName: 'Имя кошелька',

      security: 'Безопасность',
      changePassword: 'Изменить пароль',
      easyConfirmation: 'Упрощенное подтверждение транзакции',

      removeWallet: 'Удалить кошелек',
    },
    ApplicationTab: {
      title: 'Настройки',
      tabTitle: 'Приложение',

      language: 'Ваш язык',

      security: 'Безопасность',
      changePin: 'Изменить PIN',
      biometricsSignIn: 'Войти, используя мои биометрические данные',

      crashReporting: 'Сбой в предоставлении отчета',
      crashReportingText:
        'Отправить отчеты о сбоях в Emurgo. ' +
        'Изменения в этой опции будут отражены ' +
        ' после перезагрузки приложения.',

      termsOfUse: 'Условия использования',
      support: 'Поддержка',
    },
  },
  SupportScreen: {
    title: 'Поддержка',
    faq: {
      label: 'Просмотреть часто задаваемые вопросы',
      description:
        'Если Вы столкнулись с трудностями, пожалуйста, посетите раздел FAQ ' +
        'на сайте Yoroi для поиска ответа на Ваш вопрос.',
      url: 'https://yoroi-wallet.com/faq/',
    },
    report: {
      label: 'Сообщить о проблеме',
      description:
        'Если раздел FAQ не решил возникший у Вас вопрос ' +
        'пожалуйста, воспользуйтесь нашей опцией запроса в Поддержку.',
      url: 'https://yoroi-wallet.com/support/',
    },
  },
  TermsOfServiceScreen: {
    title: 'Соглашение о предоставлении услуг',
    content: termsOfService,
    aggreeClause: 'Я согласен с условиями предоставления услуг',
    continueButton: 'Принять',
    savingConsentModalTitle: 'Инициализация',
    pleaseWait: common.pleaseWait,
  },
  WalletSelectionScreen: {
    header: 'Ваши кошельки',
    addWalletButton: 'Добавить кошелек',
  },
  BiometricsLinkScreen: {
    enableFingerprintsMessage:
      'Сначала включите использование отпечатков пальцев в настройках устройства!',
    notNowButton: 'Не сейчас',
    linkButton: 'Ссылка',
    headings: ['Используйте свой отпечаток пальца'],
    subHeadings: ['для более быстрого, легкого доступа', 'к своему Yoroi кошельку'],
  },
  // TODO(ppershing): this localization is a mess
  BiometricsAuthScreen: {
    authorizeOperation: 'Авторизовать операцию',
    useFallbackButton: 'Использовать запасной вариант',
    headings: ['Авторизовать со своим', 'отпечатком пальца'],
    cancelButton: 'Отменить',
    errors: {
      NOT_RECOGNIZED: 'Отпечаток пальца не был распознан, попробуйте еще раз',
      SENSOR_LOCKOUT: 'Вы использовали слишком много пальцев, датчик отключен',
      SENSOR_LOCKOUT_PERMANENT:
        'Вы навсегда заблокировали свой датчик отпечатков пальцев. Используйте запасной вариант.',
      DECRYPTION_FAILED: 'Сбой датчика отпечатков пальцев, используйте запасной вариант',
      UNKNOWN_ERROR: 'Неизвестная ошибка',
    },
  },
  RemoveWalletScreen: {
    title: 'Удалить кошелек',
    description: {
      paragraph1:
        'Если Вы действительно хотите навсегда удалить кошелек, ' +
        'убедитесь, что Вы записали мнемоническую фразу.',
      paragraph2: 'Для подтверждения этой операции введите имя кошелька ниже.',
    },
    walletName: 'Имя кошелька',
    walletNameInput: 'Имя кошелька',
    remove: 'Удалить кошелек',
    hasWrittenDownMnemonic:
      'Я записал мнемоническую фразу и я понимаю, ' +
      'что я не могу восстановить свой кошелек без нее.',
  },

  ChoosePinScreen: {
    title: 'Установить PIN-код',
    PinRegistrationForm: {
      PinInput: {
        title: 'Ввести PIN',
        subtitle: 'Выбрать новый PIN для быстрого доступа к кошельку.',
      },
      PinConfirmationInput: {
        title: 'Повторить PIN',
      },
    },
  },
  ChangePasswordScreen: {
    title: 'Изменить пароль кошелька',
    oldPasswordInput: {
      label: 'Текущий пароль',
    },
    newPasswordInput: {
      label: 'Новый пароль',
    },
    repeatPasswordInput: {
      label: 'Повторить новый пароль',
      errors: {
        passwordsDoNotMatch: 'Пароли не совпадают',
      },
    },
    continueButton: 'Изменить пароль',
  },
  ChangeCustomPinScreen: {
    title: 'Изменить PIN',
    CurrentPinInput: {
      title: 'Ввести PIN',
      subtitle: 'Введите свой текущий PIN',
    },
    PinRegistrationForm: {
      PinInput: {
        title: 'Ввести PIN',
        subtitle: 'Выбрать новый PIN для быстрого доступа к кошельку.',
      },
      PinConfirmationInput: {
        title: 'Повторить PIN',
      },
    },
  },
  EasyConfirmationScreen: {
    title: 'Упрощенное подтверждение',
    enable: {
      heading:
        'Эта опция позволит Вам отправлять ADA транзакции со своего кошелька, ' +
        'просто подтверждая их с помощью отпечатка пальца или ' +
        'с запасным вариантом стандартной системы распознавания лица. ' +
        'Это делает Ваш кошелек менее безопасным. Это копромисс ' +
        'между UX и безопасностью!',
      warning:
        'Пожалуйста, помните свой мастер-пароль, так как он может Вам понадобиться ' +
        'в случае, если Ваши биометрические данные будут удалены с устройства.',
      masterPassword: 'Мастер-пароль',
      enableButton: 'Включить',
    },
    disable: {
      heading:
        'Отключая эту опцию, Вы сможете тратить свою ADA ' +
        'только с мастер-паролем.',
      disableButton: 'Отключить',
    },
  },
  Biometry: {
    approveTransaction: 'Авторизовать со своим отпечатком пальца',
    subtitle: '', // subtitle for the biometry dialog Andoid 9
    description: '', // description of the biometry dialog Android 9
    cancelButton: 'Отменить',
  },
}

export default l10n
