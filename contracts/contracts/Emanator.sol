pragma solidity ^0.7.0;

contract DSMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }
    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, "ds-math-sub-underflow");
    }
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function min(uint x, uint y) internal pure returns (uint z) {
        return x <= y ? x : y;
    }
    function max(uint x, uint y) internal pure returns (uint z) {
        return x >= y ? x : y;
    }
    function imin(int x, int y) internal pure returns (int z) {
        return x <= y ? x : y;
    }
    function imax(int x, int y) internal pure returns (int z) {
        return x >= y ? x : y;
    }

    uint constant WAD = 10 ** 18;
    uint constant RAY = 10 ** 27;

    //rounds to zero if x*y < WAD / 2
    function wmul(uint x, uint y) internal pure returns (uint z) {
        z = add(mul(x, y), WAD / 2) / WAD;
    }
    //rounds to zero if x*y < WAD / 2
    function rmul(uint x, uint y) internal pure returns (uint z) {
        z = add(mul(x, y), RAY / 2) / RAY;
    }
    //rounds to zero if x*y < WAD / 2
    function wdiv(uint x, uint y) internal pure returns (uint z) {
        z = add(mul(x, WAD), y / 2) / y;
    }
    //rounds to zero if x*y < RAY / 2
    function rdiv(uint x, uint y) internal pure returns (uint z) {
        z = add(mul(x, RAY), y / 2) / y;
    }

    // This famous algorithm is called "exponentiation by squaring"
    // and calculates x^n with x as fixed-point and n as regular unsigned.
    //
    // It's O(log n), instead of O(n) for naive repeated multiplication.
    //
    // These facts are why it works:
    //
    //  If n is even, then x^n = (x^2)^(n/2).
    //  If n is odd,  then x^n = x * x^(n-1),
    //   and applying the equation for even x gives
    //    x^n = x * (x^2)^((n-1) / 2).
    //
    //  Also, EVM division is flooring and
    //    floor[(n-1) / 2] = floor[n / 2].
    //
    function rpow(uint x, uint n) internal pure returns (uint z) {
        z = n % 2 != 0 ? x : RAY;

        for (n /= 2; n != 0; n /= 2) {
            x = rmul(x, x);

            if (n % 2 != 0) {
                z = rmul(z, x);
            }
        }
    }
}

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract Emanator is ERC721, IERC721Receiver, DSMath {
  using SafeMath for uint256;

  address payable public creator;
  // winLength is the number of seconds that a user must be the highBidder to win the auction;
  uint256 public winLength;

  struct Auction {
      uint256 lastBidTime;
      uint256 highBid;
      address owner;
      address highBidder;
  }

  address payable[] public revShareRecipients;
  uint256[] public ownerRevShares;
  uint256 public totalShares;

  uint256 public currentGeneration;

  ISuperfluid private host;
  IConstantFlowAgreementV1 private cfa;
  IInstantDistributionAgreementV1 private ida;
  ISuperToken private tokenX;

  mapping (uint256 => Auction) public auctionByGeneration;

  event newAuction(uint256 id);
  event auctionWon(uint256 id, address indexed winner);

  constructor(ISuperfluid _host, IConstantFlowAgreementV1 _cfa, IInstantDistributionAgreementV1 _ida, ISuperToken _tokenX, uint256 _winLength) public ERC721 ("emaNaFTe", "emNFT") {
      assert(address(_host) != address(0));
      assert(address(_cfa) != address(0));
      assert(address(_ida) != address(0));
      assert(address(_tokenX) != address(0));
      assert(winLength >= 15);
      host = _host;
      cfa = _cfa;
      ida = _ida;
      tokenX = _tokenX;
      winLength = _winLength;
      creator = msg.sender;
      ownerRevShares.push(1*10**18);
      totalShares = 1*10**18;
      setApprovalForAll(address(this), true);
      _firstAuction();

  }

  function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
      return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
  }

  function _firstAuction() private {
    ERC721._safeMint(msg.sender, 0);

    // Create the first auction
    currentGeneration = 1;

    // creating the first auction creates an income distribution agreement index
    // host.callAgreement(ida.address, ida.contract.methods.createIndex
    //    (tokenX.address, 1, "0x").encodeABI(), { from: address(this) })
    // // creating the first auction adds the creator to the income distribution agreement subscribers
    // host.callAgreement(ida.address, ida.contract.methods.updateSubscription
    //    (tokenX.address, 1, msg.sender, ownerRevShares[0], "0x").encodeABI(), { from: address(this) })

    emit newAuction(currentGeneration);
  }

  // Submit a higher bid and increase the length of the auction
  function bid(uint bidAmount) public returns (uint256 highBid, uint256 lastBidTime, address highBidder) {
      Auction storage _auction = auctionByGeneration[currentGeneration];
      uint256 endTime = _auction.lastBidTime + winLength;
      require(block.timestamp > endTime, "The current auction has ended. Please start a new one.");
      // TODO: Add a minimum bid increase threshold
      require(bidAmount > _auction.highBid, "you must bid more than the current high bid");

      tokenX.transferFrom(msg.sender, address(this), bidAmount);
      // highBidder creates new SuperFluid constant flow agreement
      // host.callAgreement(cfa.address, cfa.contract.methods.createFlow
         // (tokenX.address, address(this), msg.value, "0x").encodeABI(), { from: msg.sender })

       // new highBidder should stop previous highBidder's SuperFluid constant flow agreement
      // if (_auction.generation>0){
            // host.callAgreement(cfa.address, cfa.contract.methods.deleteFlow
                // (tokenX.address, _auction.prevHighBidder, address(this), _auction.highBid, "0x").encodeABI(), { from: address(this) }
      // }

      _auction.highBid = bidAmount;
      _auction.highBidder = msg.sender;
      _auction.lastBidTime = block.timestamp;

      return (_auction.highBid, _auction.lastBidTime, _auction.highBidder);
  }

  // End the auction and claim prize
  // TODO: allow anyone to end the auction
  function settleAndBeginAuction() public {
      Auction storage _auction = auctionByGeneration[currentGeneration];

      require(_auction.highBid > 0, "The auction has not started yet");
      uint256 endTime = _auction.lastBidTime + winLength;
      require(block.timestamp > endTime, "The auction is not over yet");

      // Auction winner mints the new childNFT
      ERC721._safeMint(_auction.highBidder, currentGeneration);

      // claiming NFT deletes the winner's SuperFluid constant flow agreement
      // host.callAgreement(cfa.address, cfa.contract.methods.deleteFlow
      // (tokenX.address, msg.sender, address(this), msg.value, "0x").encodeABI(), { from: msg.sender })

      // Upon claiming, the contract distributes the auction funds to the prior owners according to their proportion of totalShares
      uint amt = tokenX.balanceOf(address(this));
      uint creatorShare = rmul(amt, rdiv(7, 10));

      if(currentGeneration <= 1) {
          tokenX.transferFrom(address(this), creator, amt);
          revShareRecipients.push(_auction.highBidder);
      } else {
        creator.transfer(creatorShare);
        uint remainder = address(this).balance;
        uint perShare = rdiv(remainder, totalShares);
        for (uint i = 0; i < revShareRecipients.length; i++) {
          uint distro = rmul(ownerRevShares[i], perShare);
          tokenX.transferFrom(address(this), revShareRecipients[i], distro);
        }
        //Update the revenue shares array
        revShareRecipients.push(_auction.highBidder);
        uint position = ownerRevShares.length - 1;
        uint newShares = rmul(ownerRevShares[position], rdiv(9, 10));
        totalShares = totalShares + newShares;
        ownerRevShares.push(newShares);
      }

      // claiming the NFT distributes the auction's accumulated funds to the revenue share owners
      // host.callAgreement(ida.address, ida.contract.methods.updateIndex
      // (tokenX.address, 1, balanceOf(address(this)), "0x").encodeABI(), { from: address(this) })

      // claiming the NFT adds the new owner to the income distribution agreement subscribers
      // host.callAgreement(ida.address, ida.contract.methods.updateSubscription
           // (tokenX.address, 1, msg.sender, newShares, "0x").encodeABI(), { from: address(this) })

      // claiming the NFT approves the subscription
      // host.callAgreement(ida.address, ida.contract.methods.approveSubscription
           // (tokenX.address, address(this), 1, "0x").encodeABI(), { from: msg.sender })


      currentGeneration++;
      emit auctionWon(currentGeneration, _auction.highBidder);
      emit newAuction(currentGeneration);
  }

  function checkTimeRemaining() public view returns (uint) {
      Auction storage _auction = auctionByGeneration[currentGeneration];
      require(_auction.highBid > 0, "The auction has not started yet");
      uint timeLeft = _auction.lastBidTime + winLength - block.timestamp;
      return timeLeft;
  }

  function checkEndTime() public view returns (uint) {
      Auction storage _auction = auctionByGeneration[currentGeneration];
      require(_auction.highBid > 0, "The auction has not started yet");
      uint endTime = _auction.lastBidTime + winLength;
      return endTime;
  }

  function getCurrentAuctionInfo() public view returns ( uint highBid, address highBidder, uint lastBidTime){
      Auction storage _auction = auctionByGeneration[currentGeneration];
      return ( _auction.highBid, _auction.highBidder, _auction.lastBidTime);
  }

  function getAuctionInfo(uint id) public view returns ( uint highBid, address highBidder, uint lastBidTime){
      Auction storage _auction = auctionByGeneration[id];
      return ( _auction.highBid, _auction.highBidder, _auction.lastBidTime);
  }

  function getAuctionBalance() public view returns (uint balanceOf) {
      return tokenX.balanceOf(address(this));
  }
 }
