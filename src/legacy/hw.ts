export const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: true,
    VENDOR: 'ledger.com',
    MODEL: 'Nano',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
    MIN_ADA_APP_VERSION: '2.2.1',
  },
}
