import Auction from 'src/components/Auction'

export const QUERY = gql`
  query FIND_AUCTION_BY_ADDRESS($address: String!) {
    auction: auction(address: $address) {
      id
      name
      description
      createdAt
      revenue
      winLength
      owner
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Auction not found</div>

export const Success = ({ auction }) => {
  return <Auction auction={auction} />
}
