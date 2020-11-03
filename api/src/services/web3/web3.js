import { formatUnits } from '@ethersproject/units'
import { InfuraProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'

import Web3 from 'web3'

import SuperfluidSDK from '@superfluid-finance/ethereum-contracts'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'

export const web3Auction = async ({ address }) => {
  try {
    const walletlessProvider = new InfuraProvider(
      'goerli',
      process.env.INFURA_ENDPOINT_KEY
    )
    const auction = new Contract(address, Emanator.abi, walletlessProvider)
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
    return new Error(`Error getting auction ${address}. ${err}`)
  }
}

export const web3User = async ({ address, auctionAddress }) => {
  try {
    const walletlessProvider = new InfuraProvider(
      'goerli',
      process.env.INFURA_ENDPOINT_KEY
    )
    const sf = new SuperfluidSDK.Framework({
      chainId: 5,
      version: process.env.RELEASE_VERSION || 'test',
      web3Provider: new Web3.providers.HttpProvider(
        'https://goerli.infura.io/v3/ebe4d04169c4443ebe87905060aa16eb'
      ),
    })
    await sf.initialize()
    //
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletlessProvider
    )
    const superTokenAddress = await auction.tokenX()
    const superToken = await sf.contracts.ISuperToken.at(superTokenAddress)
    const superTokenBalance = await superToken.balanceOf(address)
    let isSubscribed = false

    try {
      const { approved } = await sf.agreements.ida.getSubscription(
        superTokenAddress,
        auctionAddress,
        0,
        address
      )
      if (approved) isSubscribed = true
    } catch (err) {
      // console.log(err)
    }

    return {
      superTokenBalance: superTokenBalance.toString(),
      isSubscribed,
    }
  } catch (err) {
    return new Error(`Error getting user ${address}. ${err}`)
  }
}
