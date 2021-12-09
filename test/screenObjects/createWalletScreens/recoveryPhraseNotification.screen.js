class RecoveryPhraseNotification {
  get mySecretKeyOnDeviceCheckbox() {
    return driver.$('//*[@resource-id="mnemonicBackupImportanceModal::checkBox1"]');
  }

  get recoveringOnlyByPhraseCheckbox() {
    return driver.$('//*[@resource-id="mnemonicBackupImportanceModal::checkBox2"]');
  }

  get understandButton() {
    return driver.$('//*[@resource-id="mnemonicBackupImportanceModal::confirm"]');
  }
}

module.exports = new RecoveryPhraseNotification();