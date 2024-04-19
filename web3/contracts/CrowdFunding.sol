// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MyContract {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        uint256 creationTime;
        string[] donationHash;
    }



    mapping(uint256 => Campaign)  public campaigns;

    uint256 public numberOfCampaigns = 0;

    function updateDonationHash(uint256 _campaignId, string memory _transactionHash) public {
        Campaign storage campaign = campaigns[_campaignId];
        campaign.donationHash.push(_transactionHash);
    }

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];


        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.creationTime = block.timestamp;
        
        numberOfCampaigns++;

        return numberOfCampaigns-1;
    }

    function donateTocampaign (uint256 _id) public payable {
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");

        if(sent) {
            campaign.amountCollected = campaign.amountCollected + amount;
        }

    }

    function getDonators(uint256 _id) view public returns(address[] memory, uint256[] memory, string[] memory){

        return (campaigns[_id].donators, campaigns[_id].donations, campaigns[_id].donationHash);
    }

    function getcampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allcampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i< numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allcampaigns[i] = item;
        }

        return allcampaigns;
    }


   function deleteCampaign(uint256 _id) public returns (Campaign[] memory) {
        require(_id < numberOfCampaigns, "Invalid campaign ID");
        delete campaigns[_id];
        Campaign[] memory remainingCampaigns = new Campaign[](numberOfCampaigns - 1);
        uint256 index = 0;
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            if (i != _id) {
                remainingCampaigns[index] = campaigns[i];
                index++;
            }
        }
        numberOfCampaigns--;
        return remainingCampaigns;
        }
    
}