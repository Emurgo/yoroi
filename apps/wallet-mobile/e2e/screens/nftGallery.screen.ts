import { by, element, expect } from 'detox'

export const iconSearch = () => element(by.id('iconSearch'))
export const inputSearch = () => element(by.id('inputSearch'))

export const cardNFT = (nftName: string) => element(by.id(`card_nft_${nftName}`))

export const countNftsDisplayed = async () => {
   let i = 0
   const max = 10 // let us suppose max count of NFT as 10 to limit the loop
   let exit = false

   while (!exit && i < max) {
      try {
         await expect(element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i)).toExist()
         // const nft = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i).getAttributes()
         // console.log(nft)
         i++
      } catch (e) {
         exit = true
      }
   }
   console.log('Total Number of NFTs displayed: ', i)
   return i
}

export const countNftsDisplayedIos = async () => {
  await expect(element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(0)).toExist()
   const nft = element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(0)
   const attr: object = await nft.getAttributes()
   console.log(attr)
   const count = attr['elements'].length

   console.log('Total Number of NFTs displayed: ', count)
   return count
}