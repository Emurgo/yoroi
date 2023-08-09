import { by, element, expect } from 'detox'
import jestExpect from 'expect'

export const iconSearch = () => element(by.id('iconSearch'))
export const inputSearch = () => element(by.id('inputSearch'))

export const cardNFT = (nftName: string) => element(by.id(`card_nft_${nftName}`))
export const txtNftCount = () => element(by.id('txtNftCount'))

export const countNftsDisplayedAndroid = async (max = 10) => {
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
   console.log('Total Number of NFTs counted: ', i)
   return i
}

export const checkAttributeNFTAndroid = async (nftLabel: string, max = 10) => {
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
      } catch (e) { // stop checking for any matches on all failures
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
   console.log('Total Number of NFTs counted: ', count)
   return count
}

// Note - use for iOS only
export const getElementAttributes = async (ele: Detox.IndexableNativeElement) => {
   let attributes: Detox.ElementAttributes | Detox.ElementAttributes[]

   const result = await ele.getAttributes()
   if ('elements' in result) {
      attributes = result.elements
   } else {
      attributes = result
   }
   return {
      attributes
   }
}

export const verifyNftCount = async (ele: Detox.IndexableNativeElement, nftCountExp: number) => {
   const attributes = await ele.getAttributes()

   if (!('elements' in attributes)) {
      if (attributes.label){
         console.log('NFT count displayed : ', attributes.label)  
         console.log('NFT count expected : ', nftCountExp.toString())
         if (attributes.label.includes(nftCountExp.toString())) {
            return true
         }
      }
   }
   return false
}