import Auction from 'src/components/Auction'

export const QUERY = gql`
  query FIND_AUCTION_BY_ADDRESS($address: String!) {
    auction: auction(address: $address) {
      id
      name
      address
      description
      createdAt
      revenue
      winLength
      owner
    }
    web3Auction: web3Auction(address: $address) {
      endTime
      lastBidTime
      auctionBalance
      highBid
      highBidder
      status
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Auction not found</div>

export const Success = ({ auction, web3Auction }) => {
  return <Auction auction={{ ...auction, ...web3Auction }} />
}
