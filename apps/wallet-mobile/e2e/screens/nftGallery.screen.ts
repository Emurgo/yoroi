import { by, element, expect } from 'detox'
import jestExpect from 'expect'

export const iconSearch = () => element(by.id('iconSearch'))
export const inputSearch = () => element(by.id('inputSearch'))

export const cardNFT = (nftName: string) => element(by.id(`card_nft_${nftName}`))

export const countNftsDisplayedAndroid = async (max: number) => {
   let i = 0
   let exit = false

   while (!exit && i < max) {
      try {
         await expect(element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i)).toExist()
         i++
      } catch (e) { // stop checking for any matches on all failures
         exit = true
      }
   }
   console.log('Total Number of NFTs displayed: ', i)
   return i
}

export const checkAttributeNFTAndroid = async (max: number, nftLabel: string) => {
   let i = 0
   let matched = false
   let exit = false

   /** @type {Detox.ElementAttributes} */
   let nftAttributes


   while (!exit && i < max) {
      try {
         await expect(element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i)).toExist()
         nftAttributes = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i).getAttributes()
         if (nftAttributes.label === nftLabel) {
            matched = true
            exit = true
         }
         i++
      } catch (e) { // stop checking for any matches on any failures
         exit = true
      }
   }
   if (matched) { console.log(' Match found : ', nftAttributes.label) }

   return matched
}

export const countNftsDisplayedIos = async () => {
   let count = 0
   await expect(element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/))).toExist()
   const nftAttributes = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).getAttributes()
   if ('elements' in nftAttributes) {
      count = nftAttributes.elements.length
   } else {
      jestExpect(nftAttributes.visible).toBe(true)
      count = 1
   }
   console.log('Total Number of NFTs displayed: ', count)
   return count
}