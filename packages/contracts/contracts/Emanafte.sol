pragma solidity ^0.7.0;

import { DSMath } from "./DSMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract Emanafte is ERC721, IERC721Receiver, DSMath {
  using SafeMath for uint256;

  address payable public creator;
  uint256[] public childNFTs;
  // winLength is the number of seconds that a user must be the highBidder to win the auction;
  uint256 public winLength;

  struct Auction {
      uint256 generation;
      uint256 startTime;
      uint256 lastBidTime;
      uint256 endTime;
      uint256 highBid;
      uint256[] bids;
      address payable owner;
      address payable highBidder;
      address[] bidders;
      address payable prevHighBidder;
  }

  address payable[] public revShareRecipients;
  uint256[] public ownerRevShares;
  uint256 public totalShares;

  uint256 public totalAuctions;

  ISuperfluid private host;
  IConstantFlowAgreementV1 private cfa;
  IInstantDistributionAgreementV1 private ida;
  ISuperToken private tokenX;

  mapping (uint256 => Auction) public tokenIdToAuction;

  event newAuction(address creator, uint256 id, uint256 startTime);
  event auctionWon(uint256 id, address indexed winner);

  constructor(ISuperfluid _host, IConstantFlowAgreementV1 _cfa, IInstantDistributionAgreementV1 _ida, ISuperToken _tokenX) public ERC721 ("emaNaFTe", "emNFT") {
      assert(address(host) != address(0));
      assert(address(cfa) != address(0));
      assert(address(ida) != address(0));
      assert(address(_tokenX) != address(0));
      host = _host;
      cfa = _cfa;
      ida = _ida;
      tokenX = _tokenX;
      creator = msg.sender;
      winLength = 10 seconds;
      revShareRecipients.push(creator);
      ownerRevShares.push(1000000);
      setApprovalForAll(address(this), true);

  }
  function onERC721Received(address, address, uint256, bytes calldata) external override returns (bytes4) {
      return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
  }

  function firstAuction() external returns (uint256 generation) {
    require(msg.sender == creator, "only the creator can start the first auction");
    require(totalAuctions < 1, "this function can only be called once");
    totalAuctions = 0;
    ERC721._safeMint(msg.sender, totalAuctions);
    totalShares = ownerRevShares[0];

    Auction storage _auction = tokenIdToAuction[totalAuctions];
    _auction.generation = 0;
    _auction.startTime = block.timestamp;
    _auction.endTime = block.timestamp * 2;
    _auction.highBid = 0;
    _auction.highBidder = address(0);
    _auction.prevHighBidder = address(0);

    // creating the first auction creates an income distribution agreement index
    // host.callAgreement(ida.address, ida.contract.methods.createIndex
    //    (tokenX.address, 1, "0x").encodeABI(), { from: address(this) })
    //
    //
    // // creating the first auction adds the creator to the income distribution agreement subscribers
    // host.callAgreement(ida.address, ida.contract.methods.updateSubscription
    //    (tokenX.address, 1, msg.sender, ownerRevShares[0], "0x").encodeABI(), { from: address(this) })

    emit newAuction(creator, totalAuctions, _auction.startTime);

    return _auction.generation;
  }

  function checkTimeRemaining() public view returns (uint) {
      Auction storage _auction = tokenIdToAuction[totalAuctions];
      require(_auction.bids.length >= 1, "no one has bid yet");
      uint timeLeft = _auction.endTime - block.timestamp;
      return timeLeft;
  }

  function _nextAuction(uint tokenId) private returns (uint256) {
    totalAuctions++;

    Auction storage _auction = tokenIdToAuction[tokenId];
    _auction.generation = totalAuctions;
    _auction.startTime = block.timestamp;
    _auction.endTime = block.timestamp * 2;
    _auction.highBid = 0;
    _auction.highBidder = address(0);
    _auction.prevHighBidder = address(0);

    emit newAuction(creator, tokenId, _auction.startTime);

    return _auction.generation;
  }

  function bid(uint bidAmount) public returns (uint256 highBid, uint256 lastBidTime, address highBidder) {
      Auction storage _auction = tokenIdToAuction[totalAuctions];
      require((block.timestamp < _auction.endTime), "this auction is already over");
      require(bidAmount > _auction.highBid, "you must bid more than the current high bid");

      tokenX.transferFrom(msg.sender, address(this), bidAmount );
      // highBidder creates new SuperFluid constant flow agreement
      // host.callAgreement(cfa.address, cfa.contract.methods.createFlow
         // (tokenX.address, address(this), msg.value, "0x").encodeABI(), { from: msg.sender })

       _auction.prevHighBidder = _auction.highBidder;

       // new highBidder should stop previous highBidder's SuperFluid constant flow agreement
      if (_auction.generation>0){
            // host.callAgreement(cfa.address, cfa.contract.methods.deleteFlow
                // (tokenX.address, _auction.prevHighBidder, address(this), _auction.highBid, "0x").encodeABI(), { from: address(this) }
      }

      _auction.highBid = bidAmount;
      _auction.bids.push(bidAmount);
      _auction.highBidder = msg.sender;
      _auction.bidders.push(msg.sender);
      _auction.lastBidTime = block.timestamp;
      _auction.endTime = _auction.lastBidTime + winLength;

      return (_auction.highBid, _auction.lastBidTime, _auction.highBidder);
  }

  function claimNFT() public returns (uint) {
      Auction storage _auction = tokenIdToAuction[totalAuctions];

      require(msg.sender == _auction.highBidder, "only the auction winner can claim");
      require(block.timestamp > _auction.endTime, "this auction isn't over yet");

      // claiming NFT deletes the winner's SuperFluid constant flow agreement
      // host.callAgreement(cfa.address, cfa.contract.methods.deleteFlow
           // (tokenX.address, msg.sender, address(this), msg.value, "0x").encodeABI(), { from: msg.sender })

      // auction winner mints the new childNFT
      uint childNFT = _mintChildNFT(totalAuctions);
      childNFTs.push(childNFT);

      // claiming the NFT distributes the auction's accumulated funds to the revenue share owners
      // host.callAgreement(ida.address, ida.contract.methods.updateIndex
         // (tokenX.address, 1, balanceOf(address(this)), "0x").encodeABI(), { from: address(this) })


      // Upon claiming, the contract distributes the auction funds to the prior owners according to their proportion of totalShares
      // uint amt = address(this).balance;
      // uint perShare = rdiv(amt, totalShares);

      // for (uint i = 0; i < revShareRecipients.length; i++) {
      //     uint distro = rmul(ownerRevShares[i], perShare);
      //     revShareRecipients[i].tranhoster(distro);
      // }

      // claiming an NFT automatically updates the revenue shares array
      revShareRecipients.push(msg.sender);
      uint position = ownerRevShares.length - 1;
      uint newShares = ownerRevShares[position].mul(9).div(10);
      totalShares = totalShares + newShares;
      ownerRevShares.push(newShares);

      // claiming the NFT adds the new owner to the income distribution agreement subscribers
      // host.callAgreement(ida.address, ida.contract.methods.updateSubscription
           // (tokenX.address, 1, msg.sender, newShares, "0x").encodeABI(), { from: address(this) })


      // claiming the NFT approves the subscription
      // host.callAgreement(ida.address, ida.contract.methods.approveSubscription
           // (tokenX.address, address(this), 1, "0x").encodeABI(), { from: msg.sender })


      // claiming an NFT automatically starts a new auction
      _nextAuction(childNFT);

      emit auctionWon(totalAuctions, msg.sender);
      emit newAuction(creator, childNFT, block.timestamp);
      return childNFT;
  }

  function _mintChildNFT(uint tokenId) private returns (uint) {
      uint childTokenId = tokenId + 1;
      childNFTs.push(childTokenId);
      ERC721._safeMint(msg.sender, childTokenId);
      return childTokenId;
  }

  function getAuctionInfo() public view returns (uint generation, uint highBid, address highBidder, uint startTime, uint lastBidTime){
      Auction storage _auction = tokenIdToAuction[totalAuctions];
      return (_auction.generation, _auction.highBid, _auction.highBidder, _auction.startTime, _auction.lastBidTime);
  }

  function getRevShareRecipLength() public view returns (uint){
      return revShareRecipients.length;
  }

  function getAuctionBalance() public view returns (uint) {
      return address(this).balance;
  }

 }
