
            declare module '@redwoodjs/router' {
              interface AvailableRoutes {
                newAuction: () => "/auctions/new"
auction: () => "/auctions/{id:Int}"
home: () => "/"
              }
            }

            import type AuctionPageType from '/home/dev/repos/monorepo/web/src/pages/AuctionPage/AuctionPage'
import type FatalErrorPageType from '/home/dev/repos/monorepo/web/src/pages/FatalErrorPage/FatalErrorPage'
import type HomePageType from '/home/dev/repos/monorepo/web/src/pages/HomePage/HomePage'
import type NewAuctionPageType from '/home/dev/repos/monorepo/web/src/pages/NewAuctionPage/NewAuctionPage'
import type NotFoundPageType from '/home/dev/repos/monorepo/web/src/pages/NotFoundPage/NotFoundPage'
            declare global {
              const AuctionPage: typeof AuctionPageType
const FatalErrorPage: typeof FatalErrorPageType
const HomePage: typeof HomePageType
const NewAuctionPage: typeof NewAuctionPageType
const NotFoundPage: typeof NotFoundPageType
            }
          