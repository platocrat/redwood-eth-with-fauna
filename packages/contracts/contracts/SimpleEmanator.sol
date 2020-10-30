// Version of continuous NFT auction logic without SuperFluid CFA and IDA and using ETH bidding instead of an ERC20   

pragma solidity ^0.7.0;

import { DSMath } from "./DSMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Emanator is ERC721, IERC721Receiver, DSMath {
  using SafeMath for uint256;

  address payable public creator;
  // winLength is the number of seconds that a user must be the highBidder to win the auction;
  uint256 public winLength;

  struct Auction {
      uint256 lastBidTime;
      uint256 highBid;
      address owner;
      address payable highBidder;
  }

  address payable[] public revShareRecipients;
  uint256[] public ownerRevShares;
  uint256 public totalShares;
  uint256 public currentGeneration;

  mapping (uint256 => Auction) public auctionByGeneration;

  event newAuction(uint256 id);
  event auctionWon(uint256 id, address indexed winner);

  constructor(uint256 _winLength) ERC721 ("emaNaFTe", "emNFT") {
      winLength = _winLength;
      creator = msg.sender;
      totalShares = 0;
      setApprovalForAll(address(this), true);
      _firstAuction();
  }

  function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
      return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
  }

  function _firstAuction() private {
    ERC721._safeMint(msg.sender, 0);
    currentGeneration = 1;
    
    emit newAuction(currentGeneration);
  }

  // Submit a higher bid and increase the length of the auction
  function bid() public payable returns (uint256 highBid, uint256 lastBidTime, address highBidder) {
      Auction storage _auction = auctionByGeneration[currentGeneration];
      uint256 endTime = _auction.lastBidTime + winLength;
      require(block.timestamp > endTime, "The current auction has ended. Please start a new one.");
      // TODO: Add a minimum bid increase threshold
      require(msg.value > _auction.highBid, "you must bid more than the current high bid");

      _auction.highBid = msg.value;
      _auction.highBidder = msg.sender;
      _auction.lastBidTime = block.timestamp;

      return (_auction.highBid, _auction.lastBidTime, _auction.highBidder);
  }

  // End the auction and award NFT to high bidder
  function settleAndBeginAuction() public {
      Auction storage _auction = auctionByGeneration[currentGeneration];

      require(_auction.highBid > 0, "The auction has not started yet");
      uint256 endTime = _auction.lastBidTime + winLength;
      require(block.timestamp > endTime, "The auction is not over yet");

      // Mints a new child NFT to the high bidder
      ERC721._safeMint(_auction.highBidder, currentGeneration);

      // Upon claiming, the contract distributes the auction funds 
      // For the first auction, 100% go to the creator while in subsequent auctions
      // 70% flows to the creator and the owners of the child NFTs split the remaining 30% proportional to their shares
      uint amt = address(this).balance;
      uint creatorShare = rmul(amt, rdiv(7, 10));
      
      if(currentGeneration <= 1) {
          creator.transfer(amt);
          revShareRecipients.push(_auction.highBidder);
          ownerRevShares.push(1*10**18);
          totalShares = 1*10**18;
      } else {
        creator.transfer(creatorShare);
        uint remainder = address(this).balance;
        uint perShare = rdiv(remainder, totalShares);
        for (uint i = 0; i < revShareRecipients.length; i++) {
          uint distro = rmul(ownerRevShares[i], perShare);
          revShareRecipients[i].transfer(distro);
        }
          //Update the revenue shares array
          revShareRecipients.push(_auction.highBidder);
          uint position = ownerRevShares.length - 1;
          uint newShares = rmul(ownerRevShares[position], rdiv(9, 10));
          totalShares = totalShares + newShares;
          ownerRevShares.push(newShares);
      }
      
      emit auctionWon(currentGeneration, _auction.highBidder);

      _nextAuction();
  }

  function _nextAuction() private {
    currentGeneration++;
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
      return address(this).balance;
  }
 }
