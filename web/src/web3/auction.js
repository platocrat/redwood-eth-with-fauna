import { Contract } from '@ethersproject/contracts'
import SuperfluidSDK from '@superfluid-finance/ethereum-contracts'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'
import ERC20 from '@superfluid-finance/ethereum-contracts/build/contracts/ERC20.json'

import { getErrorResponse } from './general'
import { unlockBrowser } from './connect'

export const approve = async ({ amount, auctionAddress, tokenAddress }) => {
  try {
    const { error, walletProvider, walletAddress } = await unlockBrowser({
      debug: true,
    })

    const amountBn = parseUnits(amount.toString(), 18)
    if (amountBn.gt(allowances[token].amount)) return true

    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )

    const token = new Contract(
      tokenAddress,
      ERC20.abi,
      walletProvider.getSigner()
    )

    const allowance = token.allowance(walletAddress, auctionAddress)

    const tx = await auction.bid(amount)

    return { tx }
  } catch (err) {
    return {
      ...getErrorResponse(err, 'bid'),
    }
  }
}

export const bid = async ({ amount, auctionAddress }) => {
  try {
    const { error, walletProvider } = await unlockBrowser({
      debug: true,
    })

    const contract = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )
    const tx = await contract.bid(amount)

    return { tx }
  } catch (err) {
    return {
      ...getErrorResponse(err, 'bid'),
    }
  }
}
