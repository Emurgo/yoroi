import {device, expect} from 'detox'

import * as initialScreen from '../../screens/initialScreen.screen'
import * as analyticsScreen from '../../screens/shareUserInsights.screen'

describe('General checks', () => {
 beforeAll(async () => {
  await device.launchApp({newInstance: true})
 })

 it('should be able to check if initial screen is loaded', async () => {
  await expect(element(by.text('Select language'))).toBeVisible()
 })

 it('should be able to select/reselect a language of choice', async () => {
  await expect(initialScreen.dropDownLanguagePicker()).toBeVisible()
  await initialScreen.dropDownLanguagePicker().tap()
  await initialScreen.buttonSelectLanguageItalian().tap()
  await initialScreen.buttonSelectLanguageEnglish().tap()

  await initialScreen.buttonBack().tap()
 })

 it('should be able to verify the Privacy Policy link', async () => {
  await expect(initialScreen.linkPrivacyPolicy()).toBeVisible()
  await initialScreen.linkPrivacyPolicy().tap()
  await expect(element(by.text('3. Collection of Personal Data'))).toBeVisible()
  await initialScreen.buttonBack2().tap()
 })

 it('should be able to verify the ToS link', async () => {
  await expect(initialScreen.linkToS()).toBeVisible()
  await initialScreen.linkToS().tap()
  await expect(element(by.text('1. Rights and Obligations'))).toBeVisible()
  await initialScreen.buttonBack2().tap()
 })

 it('should be able to select checkbox and proceed', async () => {
  await initialScreen.checkboxSelect().tap({x: 5, y: 10})
  await initialScreen.buttonContinue().tap()
 })

 it('should be able to skip consent for analytics and proceed', async () => {
  await expect(analyticsScreen.txt_PageTitle()).toBeVisible()
  await analyticsScreen.btn_Skip().tap()
  await expect(element(by.text('Enter PIN'))).toBeVisible()
 })
})
