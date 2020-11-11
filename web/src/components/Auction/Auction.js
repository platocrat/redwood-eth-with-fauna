import { useState, useEffect } from 'react'
import { useMutation, useFlash } from '@redwoodjs/web'
import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

import NewAuction from 'src/components/NewAuction'
import Web3UserCell from 'src/components/Web3UserCell/Web3UserCell'
import { Row, Column } from 'src/components/core/Grid'
import Address from 'src/components/core/Address'
import Spacer from 'src/components/core/Spacer'

import { QUERY } from 'src/components/AuctionsCell'

import { bid, settleAndBeginAuction } from 'src/web3/auction'
import { unlockBrowser } from 'src/web3/connect'

export const PromptContainer = styled.div`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: ${themeGet('space.4')};
`

export const Container = styled.div`
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  padding: ${themeGet('space.4')};
`

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}

const getProgressBar = (status, winLength) => {
  let barText = '<TIME LEFT / PROGRESS BAR>'
  let subText = `Auction win time: ${winLength} seconds`
  if (status === 'created') barText = 'Waiting for first Bid'
  if (status === 'ended') {
    barText = '🔨 Auction ended ⏳'
    subText = 'Waiting to start the next one'
  }
  return (
    <>
      <h3>{barText}</h3>
      {subText}
    </>
  )
}

const getPromptBox = (
  status,
  isHighBidder,
  highBid,
  winLength,
  auctionAddress
) => {
  const bidAmount = typeof highBid === 'number' ? Number(highBid) + 5 : '0'
  let onClick = () => bid({ amount: bidAmount, auctionAddress })
  let estTotal = winLength
  let promptText = `Become the high bidder - Bid ${bidAmount} DAI`
  let buttonText = 'approve & bid'
  if (status === 'ended') {
    promptText = 'After settlement, a new auction will begin immediately'
    buttonText = 'Settle Auction'
    onClick = () => settleAndBeginAuction({ auctionAddress })
  }
  if (isHighBidder) promptText = 'You are the highest bidder!'

  return (
    <PromptContainer>
      <Spacer mb={4} />
      <p>{promptText}</p>
      <Spacer mb={4} />
      <div className="rw-button-group">
        <button
          className="rw-button rw-button-blue"
          disabled={isHighBidder}
          onClick={onClick}
        >
          {buttonText}
        </button>
      </div>
    </PromptContainer>
  )
}

const displayAuctionRevenueTable = ({ auction, bidders }) => (
  <div className="rw-segment rw-table-wrapper-responsive">
    <table className="rw-table">
      <thead>
        <tr>
          <th>Recipient</th>
          <th>Revenue to Date</th>
        </tr>
      </thead>
      <tbody>
        {bidders.map((bidder, index) => {
          const bidderText =
            index === 0 ? (
              <Address address={bidder.address}>Creator</Address>
            ) : (
              <Address address={bidder.address} />
            )

          return (
            <tr>
              <td>{bidderText}</td>
              <td>{bidder.revenue}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

const displayAuctionDetailsTable = ({ auction }) => (
  <>
    <header className="rw-segment-header">
      <h2 className="rw-heading rw-heading-secondary">Details</h2>
    </header>
    <table className="rw-table">
      <tbody>
        <tr>
          <th>High bid</th>
          <td>{auction.highBid}</td>
        </tr>
        <tr>
          <th>High bidder</th>
          <td>
            <Address address={auction.highBidder} />
          </td>
        </tr>
        <tr>
          <th>Last bid time</th>
          <td>
            {typeof auction.lastBidTime === 'string'
              ? auction.lastBidTime
              : timeTag(auction.lastBidTime)}
          </td>
        </tr>
        <tr>
          <th>Auction close time</th>
          <td>
            {typeof auction.endTime === 'string'
              ? auction.endTime
              : timeTag(auction.endTime)}
          </td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{auction.description}</td>
        </tr>
        <tr>
          <th>Address</th>
          <td>
            <Address address={auction.address} />
          </td>
        </tr>
        <tr>
          <th>Owner</th>
          <td>
            <Address address={auction.owner} />
          </td>
        </tr>
        <tr>
          <th>Launch date</th>
          <td>{timeTag(auction.createdAt)}</td>
        </tr>
      </tbody>
    </table>
  </>
)

const Auction = ({ auction }) => {
  const { addMessage } = useFlash()
  const [walletAddress, setWalletAddress] = useState(null)

  const unlockWallet = async () => {
    const { walletAddress: address, error } = await unlockBrowser({
      debug: true,
    })
    if (error) console.log(error)
    setWalletAddress(address)
  }

  useEffect(() => {
    unlockWallet()
  }, [])

  return (
    <Container>
      <h1>
        <b>{auction.name}</b>
      </h1>
      <h3>Generation: {auction.currentGeneration}</h3>
      {getProgressBar(status, auction.winLength)}
      <Row gap="10px">
        <Column>
          {getPromptBox(
            auction.status,
            false,
            auction.highBid,
            auction.winLength,
            auction.address
          )}
        </Column>
        <Column>
          <Container>
            <h1 className="rw-heading rw-heading-primary">
              ${auction.auctionBalance.toFixed(2)}
            </h1>
            <p>Current Auction Revenue</p>
          </Container>
          {displayAuctionRevenueTable({
            auction,
            bidders: [
              { address: '0xabc', revenue: 10 },
              { address: '0xabc', revenue: 10 },
              { address: '0xabc', revenue: 10 },
            ],
          })}
        </Column>
      </Row>
      <Spacer mb={4} />
      <Row gap="10px">
        <Column>
          {walletAddress && (
            <Web3UserCell
              address={walletAddress}
              auctionAddress={auction.address}
            />
          )}
        </Column>
        <Column>{displayAuctionDetailsTable({ auction })}</Column>
      </Row>
    </Container>
  )
}

export default Auction
