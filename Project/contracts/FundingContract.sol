// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title FundingContract
 * @dev A decentralized crowdfunding platform with milestone-based funding
 */
contract FundingContract is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // Campaign structure
    struct Campaign {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 deadline;
        uint256 minimumContribution;
        bool isActive;
        bool isFunded;
        bool isCompleted;
        uint256 milestonesCount;
        mapping(uint256 => Milestone) milestones;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    // Milestone structure for phased funding
    struct Milestone {
        uint256 id;
        string description;
        uint256 amount;
        uint256 deadline;
        bool isCompleted;
        bool isApproved;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
    }

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    event MilestoneCreated(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        string description,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId
    );
    
    event FundsWithdrawn(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 amount
    );
    
    event RefundProcessed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    // State variables
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;
    mapping(address => uint256[]) public contributorCampaigns;
    
    uint256 public campaignCounter;
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public constant PERCENTAGE_BASE = 10000;
    address public feeCollector;
    
    // Modifiers
    modifier onlyCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Only creator can call this");
        _;
    }
    
    modifier onlyContributor(uint256 _campaignId) {
        require(campaigns[_campaignId].contributions[msg.sender] > 0, "Only contributors can call this");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign deadline passed");
        _;
    }

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    /**
     * @dev Create a new funding campaign
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _duration,
        uint256 _minimumContribution
    ) external returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_minimumContribution > 0, "Minimum contribution must be greater than 0");
        
        uint256 campaignId = campaignCounter++;
        Campaign storage campaign = campaigns[campaignId];
        
        campaign.id = campaignId;
        campaign.creator = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.targetAmount = _targetAmount;
        campaign.deadline = block.timestamp + _duration;
        campaign.minimumContribution = _minimumContribution;
        campaign.isActive = true;
        
        creatorCampaigns[msg.sender].push(campaignId);
        
        emit CampaignCreated(campaignId, msg.sender, _title, _targetAmount, campaign.deadline);
        return campaignId;
    }

    /**
     * @dev Contribute to a campaign
     */
    function contribute(uint256 _campaignId) 
        external 
        payable 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.value >= campaign.minimumContribution, "Contribution below minimum");
        require(!campaign.isFunded, "Campaign already funded");
        
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
            contributorCampaigns[msg.sender].push(_campaignId);
        }
        
        campaign.contributions[msg.sender] = campaign.contributions[msg.sender].add(msg.value);
        campaign.raisedAmount = campaign.raisedAmount.add(msg.value);
        
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.isFunded = true;
        }
        
        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    /**
     * @dev Create a milestone for a campaign
     */
    function createMilestone(
        uint256 _campaignId,
        string memory _description,
        uint256 _amount,
        uint256 _duration
    ) external onlyCreator(_campaignId) campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isFunded, "Campaign must be funded first");
        
        uint256 milestoneId = campaign.milestonesCount++;
        Milestone storage milestone = campaign.milestones[milestoneId];
        
        milestone.id = milestoneId;
        milestone.description = _description;
        milestone.amount = _amount;
        milestone.deadline = block.timestamp + _duration;
        
        emit MilestoneCreated(_campaignId, milestoneId, _description, _amount);
    }

    /**
     * @dev Vote on milestone completion
     */
    function voteOnMilestone(
        uint256 _campaignId,
        uint256 _milestoneId,
        bool _approve
    ) external onlyContributor(_campaignId) campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        Milestone storage milestone = campaign.milestones[_milestoneId];
        
        require(!milestone.hasVoted[msg.sender], "Already voted");
        require(!milestone.isCompleted, "Milestone already completed");
        
        milestone.hasVoted[msg.sender] = true;
        
        if (_approve) {
            milestone.votesFor = milestone.votesFor.add(campaign.contributions[msg.sender]);
        } else {
            milestone.votesAgainst = milestone.votesAgainst.add(campaign.contributions[msg.sender]);
        }
        
        // Check if milestone is approved (simple majority by contribution amount)
        if (milestone.votesFor > campaign.raisedAmount.div(2)) {
            milestone.isApproved = true;
        }
    }

    /**
     * @dev Withdraw funds after milestone approval
     */
    function withdrawMilestoneFunds(
        uint256 _campaignId,
        uint256 _milestoneId
    ) external onlyCreator(_campaignId) campaignExists(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        Milestone storage milestone = campaign.milestones[_milestoneId];
        
        require(milestone.isApproved, "Milestone not approved");
        require(!milestone.isCompleted, "Milestone already completed");
        require(address(this).balance >= milestone.amount, "Insufficient contract balance");
        
        milestone.isCompleted = true;
        
        // Calculate platform fee
        uint256 fee = milestone.amount.mul(platformFeePercentage).div(PERCENTAGE_BASE);
        uint256 amountAfterFee = milestone.amount.sub(fee);
        
        // Transfer funds
        payable(feeCollector).transfer(fee);
        payable(campaign.creator).transfer(amountAfterFee);
        
        emit MilestoneCompleted(_campaignId, _milestoneId);
        emit FundsWithdrawn(_campaignId, _milestoneId, amountAfterFee);
    }

    /**
     * @dev Request refund if campaign fails
     */
    function requestRefund(uint256 _campaignId) 
        external 
        onlyContributor(_campaignId) 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(!campaign.isFunded, "Campaign was funded");
        
        uint256 contributionAmount = campaign.contributions[msg.sender];
        require(contributionAmount > 0, "No contribution to refund");
        
        campaign.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributionAmount);
        
        emit RefundProcessed(_campaignId, msg.sender, contributionAmount);
    }

    /**
     * @dev Get campaign details
     */
    function getCampaignDetails(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            address creator,
            string memory title,
            string memory description,
            uint256 targetAmount,
            uint256 raisedAmount,
            uint256 deadline,
            bool isActive,
            bool isFunded,
            bool isCompleted
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.targetAmount,
            campaign.raisedAmount,
            campaign.deadline,
            campaign.isActive,
            campaign.isFunded,
            campaign.isCompleted
        );
    }

    /**
     * @dev Get contributor's contribution amount
     */
    function getContribution(uint256 _campaignId, address _contributor) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (uint256) 
    {
        return campaigns[_campaignId].contributions[_contributor];
    }

    /**
     * @dev Get all campaigns created by a user
     */
    function getCreatorCampaigns(address _creator) external view returns (uint256[] memory) {
        return creatorCampaigns[_creator];
    }

    /**
     * @dev Get all campaigns contributed to by a user
     */
    function getContributorCampaigns(address _contributor) external view returns (uint256[] memory) {
        return contributorCampaigns[_contributor];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _newFeePercentage;
    }

    /**
     * @dev Update fee collector address (only owner)
     */
    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "Invalid address");
        feeCollector = _newFeeCollector;
    }

    /**
     * @dev Emergency pause campaign (only owner)
     */
    function pauseCampaign(uint256 _campaignId) external onlyOwner campaignExists(_campaignId) {
        campaigns[_campaignId].isActive = false;
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
