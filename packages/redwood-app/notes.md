### Resources

- https://redwoodjs.com/docs/cli-commands

### Steps I took

```bash
yarn rw generate layout default
yarn rw generate page home /
yarn rw generate page auction {auctionAddress}
# Update the schema.prisma to add the user, bid, auction object
yarn rw db save
yarn rw db up
yarn rw generate scaffold User
yarn rw generate scaffold Auction

```

### Notes

`yarn rw generate scaffold` Does not work perfectly for all prisma arelations. See https://redwoodjs.com/docs/schema-relations
