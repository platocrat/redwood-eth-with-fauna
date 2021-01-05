import Auction from 'src/components/Auction'

/**
 * @todo
 * @dev There is an ambiguous error in querying the data.
 * The graphql API returns an error basically saying that all fields of `Auction`
 * are returned as `null`, and fields cannot return `null`
 */
export const QUERY = gql`
  query auction($address: String!) {
    auction(address: $address) {
      # id
      # name
      # address
      # description
      # contentHash
      # createdAt
      # winLength
      # owner
    }
    web3Auction(address: $address) {
      endTime
      lastBidTime
      auctionBalance
      highBid
      highBidder
      status
      currentGeneration
      # Unfortunately, the Fauna GraphQL API does not support custom scalars.
      # So, we'll this field from the app.
      # pastAuctions: JSON!
      revenue
    }
  }
`

export const beforeQuery = (props) => {
  return { variables: props, pollInterval: 5000 }
}

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Auction not found</div>

export const Success = ({ auction, web3Auction }) => {
  return <Auction auction={ { ...auction, ...web3Auction } } />
}
