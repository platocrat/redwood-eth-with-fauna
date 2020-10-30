export const schema = gql`
  type Auction {
    id: Int!
    address: String!
    name: String!
    description: String
    createdAt: DateTime!
    status: String!
    highBid: Int!
    generation: Int!
    revenue: Int!
    owner: User!
    ownerAddress: String!
    bids: [Bid]!
  }

  type Query {
    auctions: [Auction!]!
    auction(id: Int!): Auction
  }

  input CreateAuctionInput {
    address: String!
    name: String!
    description: String
    status: String!
    highBid: Int!
    generation: Int!
    revenue: Int!
    ownerAddress: String!
  }

  input UpdateAuctionInput {
    address: String
    name: String
    description: String
    status: String
    highBid: Int
    generation: Int
    revenue: Int
    ownerAddress: String
  }

  type Mutation {
    createAuction(input: CreateAuctionInput!): Auction!
    updateAuction(id: Int!, input: UpdateAuctionInput!): Auction!
    deleteAuction(id: Int!): Auction!
  }
`
