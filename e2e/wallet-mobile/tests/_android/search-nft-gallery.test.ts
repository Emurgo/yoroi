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
  await myWalletsScreen.buttonDeveloperOptions().tap()
  await expect(devOptionsScreen.buttonRestoreWallet2()).toBeVisible()
  await devOptionsScreen.buttonRestoreWallet2().tap()
  await waitFor(myWalletsScreen.pageTitle()).toBeVisible().withTimeout(5000)
  await waitFor(myWalletsScreen.tabWallet('Wallet 2'))
   .toBeVisible()
   .withTimeout(10000)
 })

 it('should be able to open "Wallet 2"', async () => {
  await myWalletsScreen.tabWallet('Wallet 2').tap()
  await expect(walletMenuScreen.menuNFTGallery()).toBeVisible()
 })

 it('should be able to open "NFT Gallery" and verify the total count of NFTs displayed', async () => {
  await walletMenuScreen.menuNFTGallery().tap()
  await waitFor(nftGalleryScreen.iconSearch()).toBeVisible().withTimeout(10000)

  const nftCount = await nftGalleryScreen.countNftsDisplayedAndroid()
  jestExpect(
   await nftGalleryScreen.verifyNftCount(
    nftGalleryScreen.txtNftCount(),
    nftCount,
   ),
  ).toBe(true)
 })

 it('should be able to search for a keyword that reutrns "one" matching NFT', async () => {
  nftToSearch = 'bmw'
  expectedCountMatchingNFT = 1
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  jestExpect(await nftGalleryScreen.countNftsDisplayedAndroid()).toBe(
   expectedCountMatchingNFT,
  )
  jestExpect(await nftGalleryScreen.checkAttributeNftAndroid(nftToSearch)).toBe(
   true,
  )
 })

 it('should be able to search for a keyword that reutrns "multiple" matching NFTs', async () => {
  nftToSearch = 'nft'
  expectedCountMatchingNFT = 2
  await nftGalleryScreen.buttonBack().tap()
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  jestExpect(await nftGalleryScreen.countNftsDisplayedAndroid()).toBe(
   expectedCountMatchingNFT,
  )
  jestExpect(await nftGalleryScreen.checkAttributeNftAndroid(nftToSearch)).toBe(
   true,
  )
 })

 it('should be able to search for a keyword that reutrns "no" matching NFTs', async () => {
  nftToSearch = '###'
  await nftGalleryScreen.buttonBack().tap()
  await nftGalleryScreen.iconSearch().tap()
  await nftGalleryScreen.inputSearch().tap()
  await nftGalleryScreen.inputSearch().typeText(nftToSearch)
  await expect(nftGalleryScreen.txtNoNftFound()).toBeVisible()
 })
})
