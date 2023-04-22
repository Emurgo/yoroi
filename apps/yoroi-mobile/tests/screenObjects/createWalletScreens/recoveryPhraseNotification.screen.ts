export const mySecretKeyOnDeviceCheckbox = () =>
  driver.$('//*[@resource-id="mnemonicBackupImportanceModal::checkBox1"]')
export const recoveringOnlyByPhraseCheckbox = () =>
  driver.$('//*[@resource-id="mnemonicBackupImportanceModal::checkBox2"]')
export const understandButton = () => driver.$('//*[@resource-id="mnemonicBackupImportanceModal::confirm"]')
