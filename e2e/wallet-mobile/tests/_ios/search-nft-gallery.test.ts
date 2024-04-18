import {device, expect} from 'detox'
import jestExpect from 'expect'

import * as constants from '../../general/constants'
import * as devOptionsScreen from '../../screens/devOptionsScreen.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as nftGalleryScreen from '../../screens/nftGallery.screen'
import * as walletMenuScreen from '../../screens/walletMenuItems.screen'
import * as utils from '../../general/utils'

describe('Search for an NFT from gallery and verify', () => {
 let nftToSearch: string
 let expectedCountMatchingNFT: number

 beforeAll(async () => {
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to add the "default Wallet 2" from dev options', async () => {
  await utils.takeScreenshot('My Wallets')
  await myWalletsScreen.buttonDeveloperOptions().tap()
  await expect(devOptionsScreen.buttonRestoreWallet2()).toBeVisible()
  await devOptionsScreen.buttonRestoreWallet2().tap()
  await waitFor(myWalletsScreen.pageTitle()).toBeVisible().withTimeout(5000)
  await waitFor(myWalletsScreen.tabWallet('Wallet 2')).toBeVisible().withTimeout(10000)
  await utils.takeScreenshot('Wallet 2 is added')
 })

 it('should be able to open "Wallet 2"', async () => {
  await myWalletsScreen.tabWallet('Wallet 2').tap()
  await expect(walletMenuScreen.menuNFTGallery()).toBeVisible()
  await utils.takeScreenshot('Wallet 2 Home screen')
 })

 it('should be able to open "NFT Gallery" and verify the total count of NFTs displayed', async () => {
  await walletMenuScreen.menuNFTGallery().tap()
  await waitFor(nftGalleryScreen.iconSearch()).toBeVisible().withTimeout(10000)

  const nftCount = await nftGalleryScreen.countNftsDisplayedIos()
  await utils.takeScreenshot(`NFT Gallery !! Total number of NFTs : ${nftCount}`)
  jestExpect(await nftGalleryScreen.verifyNftCount(nftGalleryScreen.txtNftCount(), nftCount)).toBe(true)
 })

 it('should be able to search for a keyword that reutrns "one" matching NFT', async () => {
  nftToSearch = 'bmw'
  expectedCountMatchingNFT = 1
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  jestExpect(await nftGalleryScreen.countNftsDisplayedIos()).toBe(expectedCountMatchingNFT)
  jestExpect(await nftGalleryScreen.checkAttributeOfNftIos(nftToSearch)).toBe(true)
  await utils.takeScreenshot(`Search results for keyword : "${nftToSearch}"`)
 })

 it('should be able to search for a keyword that reutrns "mutliple" matching NFTs', async () => {
  nftToSearch = '_sky'
  expectedCountMatchingNFT = 2
  await nftGalleryScreen.buttonBack().tap()
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  jestExpect(await nftGalleryScreen.countNftsDisplayedIos()).toBe(expectedCountMatchingNFT)
  jestExpect(await nftGalleryScreen.checkAttributeOfNftIos(nftToSearch)).toBe(true)
  await utils.takeScreenshot(`Search results for keyword : "${nftToSearch}"`)
 })

 it('should be able to search for a keyword that reutrns "zero" matching NFTs', async () => {
  nftToSearch = '###'
  await nftGalleryScreen.buttonBack().tap()
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  await expect(nftGalleryScreen.txtNoNftFound()).toBeVisible()
  await utils.takeScreenshot(`Search results for keyword : "${nftToSearch}"`)
 })
})
