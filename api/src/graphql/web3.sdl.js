export const schema = gql`
  type Web3Auction {
    highBidder: String!
    status: String!
    highBid: Int!
    currentGeneration: Int!
    auctionBalance: Int!
    endTime: String!
    lastBidTime: String!
    # Unfortunately, the Fauna GraphQL API does not support custom scalars
    # pastAuctions: JSON!
    revenue: Int!
  }

  type Web3User {
    superTokenBalance: String!
    isSubscribed: Boolean!
  }

  type Query {
    web3Auction(address: String!): Web3Auction!
    web3User(address: String!, auctionAddress: String!): Web3User!
  }
`
