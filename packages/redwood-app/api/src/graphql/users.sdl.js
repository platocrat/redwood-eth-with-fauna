export const schema = gql`
  type User {
    id: Int!
    address: String!
    name: String
    auctions: [Auction]!
    bids: [Bid]!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  input CreateUserInput {
    address: String!
    name: String
  }

  input UpdateUserInput {
    address: String
    name: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: Int!, input: UpdateUserInput!): User!
    deleteUser(id: Int!): User!
  }
`
