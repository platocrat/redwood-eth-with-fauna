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

  uint32 public constant INDEX_ID = 0;
  // winLength is the number of seconds that a user must be the highBidder to win the auction;
  uint32 public winLength;
  uint32 public currentGeneration;

  uint[] public ownerRevShares = [1*10**18];

  address payable public creator;
  address[] public revShareRecipients;

  ISuperfluid private host;
  IConstantFlowAgreementV1 private cfa;
  IInstantDistributionAgreementV1 private ida;
  ISuperToken private tokenX;

  struct Auction {
    uint256 lastBidTime;
    uint256 highBid;
    address owner;
    address highBidder;
  }

  mapping (uint256 => Auction) public auctionByGeneration;

  event newAuction(uint256 id);
  event auctionWon(uint256 id, address indexed winner);

  constructor(ISuperfluid _host, IConstantFlowAgreementV1 _cfa, IInstantDistributionAgreementV1 _ida, ISuperToken _tokenX, uint32 _winLength) ERC721 ("Emanator", "ENFT") {
      // assert(address(_host) != address(0));
      // assert(address(_cfa) != address(0));
      // assert(address(_ida) != address(0));
      // assert(address(_tokenX) != address(0));
      // assert(winLength >= 15);
      host = _host;
      cfa = _cfa;
      ida = _ida;
      tokenX = _tokenX;
      winLength = _winLength;
      creator = msg.sender;
      revShareRecipients.push(msg.sender);
      setApprovalForAll(address(this), true);

      host.callAgreement(
          ida,
          abi.encodeWithSelector(
              ida.createIndex.selector,
              tokenX,
              INDEX_ID,
              new bytes(0)
          )
      );

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
      uint256 endTime;
      if(_auction.highBid > 0){
          endTime = _auction.lastBidTime + winLength;
      } else {
          endTime = block.timestamp * 2;
      }
      require(block.timestamp < endTime, "The current auction has ended. Please start a new one.");
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

      // Mint the NFT
      ERC721._safeMint(_auction.highBidder, currentGeneration);

      // Distribute tokens
      uint distributeAmount = rmul(tokenX.balanceOf(address(this)), rdiv(7, 10));
      host.callAgreement(
          ida,
          abi.encodeWithSelector(
              ida.distribute.selector,
              tokenX,
              INDEX_ID,
              distributeAmount,
              new bytes(0)
          )
      );
      tokenX.transfer(creator, tokenX.balanceOf(address(this)));

      // Update the shares
      uint newShares = rmul(ownerRevShares[ownerRevShares.length], rdiv(9, 10));
      ownerRevShares.push(newShares);
      revShareRecipients.push(_auction.highBidder);
      host.callAgreement(
        ida,
        abi.encodeWithSelector(
          ida.updateSubscription.selector,
          tokenX,
          INDEX_ID,
          _auction.highBidder,
          newShares,
          new bytes(0)
        )
      );
      emit auctionWon(currentGeneration, _auction.highBidder);

      // Start a new auction
      currentGeneration++;
      emit newAuction(currentGeneration);
  }

  function checkTimeRemaining() public view returns (uint timeLeft) {
      Auction storage _auction = auctionByGeneration[currentGeneration];
      require(_auction.highBid > 0, "The auction has not started yet");
      return (_auction.lastBidTime + winLength - block.timestamp);
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

  function getHighBidder() public view returns (address highBidder){
      Auction storage _auction = auctionByGeneration[currentGeneration];
      return (_auction.highBidder);
  }

  function getHighBid() public view returns (uint highBid){
      Auction storage _auction = auctionByGeneration[currentGeneration];
      return (_auction.highBid);
  }

  function getLastBidTime() public view returns (uint lastBidTime){
      Auction storage _auction = auctionByGeneration[currentGeneration];
      return (_auction.lastBidTime);
  }

  function getAuctionBalance() public view returns (uint balanceOf) {
      return tokenX.balanceOf(address(this));
  }
 }
