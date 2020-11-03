import { db } from 'src/lib/db'

export const web3Auction = ({ auctionAddress }) => {
  return {
    highBidder: 'bob',
    highBid: 5,
    currentGeneration: 1,
    endTime: Date.now(),
    lastBidTime: Date.now(),
    auctionBalance: 20,
  }
}
