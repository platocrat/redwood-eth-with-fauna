import { parseUnits, formatUnits } from '@ethersproject/units'
import { InfuraProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'
import ERC20 from '@superfluid-finance/ethereum-contracts/build/contracts/ERC20.json'

export const web3Auction = async ({ auctionAddress }) => {
  try {
    const walletlessProvider = new InfuraProvider(
      'goerli',
      process.env.INFURA_ENDPOINT_KEY
    )
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletlessProvider
    )
    const {
      highBid,
      highBidder,
      lastBidTime,
    } = await auction.getCurrentAuctionInfo()

    const endTime = await auction.checkEndTime()
    const auctionBalance = await auction.getAuctionBalance()
    const currentGeneration = await auction.currentGeneration()
    let lastBidTimeFormatted = lastBidTime.toNumber() * 1000
    let endTimeFormatted = endTime.toNumber() * 1000
    let status = Date.now() < lastBidTimeFormatted ? 'started' : 'ended'

    if (lastBidTimeFormatted === 0) {
      lastBidTimeFormatted = 'No bids yet'
      endTimeFormatted = lastBidTimeFormatted
      status = 'started'
    }
    return {
      highBidder,
      highBid: Number(formatUnits(highBid, 18)).toFixed(0),
      currentGeneration,
      endTime: endTimeFormatted,
      lastBidTime: lastBidTimeFormatted,
      auctionBalance: Number(formatUnits(auctionBalance, 18)).toFixed(0),
      status,
    }
  } catch (err) {
    return new Error(`Error getting auction ${auctionAddress}. ${err}`)
  }
}
