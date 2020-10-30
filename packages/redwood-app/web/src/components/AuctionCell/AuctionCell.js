import Auction from 'src/components/Auction'

export const QUERY = gql`
  query FIND_AUCTION_BY_ID($id: Int!) {
    auction: auction(id: $id) {
      id
      address
      name
      description
      createdAt
      status
      highBid
      generation
      revenue
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Auction not found</div>

export const Success = ({ auction }) => {
  return <Auction auction={auction} />
}
