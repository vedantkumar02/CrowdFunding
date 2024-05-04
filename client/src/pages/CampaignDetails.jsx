import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import { thirdweb } from "../assets";
// const detail = [
//   {
//     blockNumber: "42353296",
//     timeStamp: "1699889498",
//     hash: "0x6cd5b6a4a08220d8039c4c317d6ae58a555b138173795dad2913a8a7b6d073b6",
//     nonce: "234",
//     blockHash:
//       "0x58213469eb1c9a5ea01b665ad2547854cc3ed2dbba04e7fdff1cd29d0e8da6a8",
//     transactionIndex: "65",
//     from: "0x3db3827962243d4252c43b1dfca1b801d1d125f1",
//     to: "0x09472583922bc5508f762326aed66cb65216041c",
//     value: "100000000000000",
//     gas: "141381",
//     gasPrice: "3044248580",
//     isError: "0",
//     txreceipt_status: "1",
//     input:
//       "0x9db00d530000000000000000000000000000000000000000000000000000000000000000",
//     contractAddress: "",
//     cumulativeGasUsed: "11656637",
//     gasUsed: "141381",
//     confirmations: "626",
//     methodId: "0x9db00d53",
//     functionName: "donateTocampaign(uint256 _id)",
//   },
//   {
//     blockNumber: "42353400",
//     timeStamp: "1699889718",
//     hash: "0xcf86a54e9d34fc3cf4ccb4fce7a52b79c82959de7884d39b1a79fcab477483d2",
//     nonce: "236",
//     blockHash:
//       "0xb5f9be72b90bb5feea693eba8e8da6dfb0d4dd99bcbf9e0c585f5ad65bae9b44",
//     transactionIndex: "3",
//     from: "0x3db3827962243d4252c43b1dfca1b801d1d125f1",
//     to: "0x09472583922bc5508f762326aed66cb65216041c",
//     value: "100000000000000",
//     gas: "90081",
//     gasPrice: "1500000016",
//     isError: "0",
//     txreceipt_status: "1",
//     input:
//       "0x9db00d530000000000000000000000000000000000000000000000000000000000000000",
//     contractAddress: "",
//     cumulativeGasUsed: "1910385",
//     gasUsed: "90081",
//     confirmations: "522",
//     methodId: "0x9db00d53",
//     functionName: "donateTocampaign(uint256 _id)",
//   },
//   {
//     blockNumber: "42353782",
//     timeStamp: "1699890530",
//     hash: "0x32cb4aa3241c1af910009a60e8d0cc30fede98176c21394be3c226df16d47c88",
//     nonce: "238",
//     blockHash:
//       "0x0da2ab963b3784a0ab202bf7d3698068b0201d65028667c36e5155dcffc770a6",
//     transactionIndex: "1",
//     from: "0x3db3827962243d4252c43b1dfca1b801d1d125f1",
//     to: "0x09472583922bc5508f762326aed66cb65216041c",
//     value: "10000000000000",
//     gas: "90081",
//     gasPrice: "2061720444",
//     isError: "0",
//     txreceipt_status: "1",
//     input:
//       "0x9db00d530000000000000000000000000000000000000000000000000000000000000000",
//     contractAddress: "",
//     cumulativeGasUsed: "156998",
//     gasUsed: "90081",
//     confirmations: "140",
//     methodId: "0x9db00d53",
//     functionName: "donateTocampaign(uint256 _id)",
//   },
// ];
const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address, deleteCampaign, transactionTime, setCreateTime, createTime} =
    useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [detail, setDetail] = useState([]);

  const remainingDays = daysLeft(state.deadline);

  const transactionCompletedTimeFunc = (milliSeconds)=>{
    let minutes, seconds;
    const transactionTimeInSeconds = milliSeconds/1000;
    if(transactionTimeInSeconds >=60){
        minutes = transactionTimeInSeconds / 60 ;
        
        seconds = transactionTimeInSeconds%60 ;

        return `${minutes}m ${seconds}s`;
        
    }else{
      seconds = transactionTimeInSeconds;
      return `${seconds}s`;
    }
  
  }

  function formatDate(creationTime) {
    // var dateObject = new Date(Date(creationTime));

    // var formattedDate = dateObject.toLocaleDateString("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    // });
    var dateObject = new Date(creationTime * 1000);
    var time = dateObject.getTime();
    var formattedDate = ` ${dateObject.getDate()}-${dateObject.getMonth()}-${dateObject.getFullYear()} at ${dateObject.getHours()}:${dateObject.getMinutes()}   `;
    return formattedDate;
  }

  const getTransactions = async (donationData) => {
    try {
      const res = await fetch(
        "https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=0xB529270b5f12C7Dc1E1Ca89A5f744DF01E6829f2&startblock=0&endblock=99999999&sort=asc&apikey=J141MSDAM9BHQGP5M7SHI8PS3F2EPUEK14",
        {
          method: "GET",
        }
      );
      console.log("Response: ", res);

      if (res.ok) {
        const transactions = await res.json();
        const transactionData = transactions.result;

        const filteredTransaction = transactionData.filter((transaction) =>
          donationData.includes(transaction.hash)
        );

        return filteredTransaction;
      }
    } catch (err) {
      console.error("Error in fetching transactions: ", err);
    }
  };

  const fetchDonators = async () => {
    const { parsedDonations, hash } = await getDonations(state.pId);
    const transactionDetails = await getTransactions(hash);
    console.log("transactionDetails: ",transactionDetails);
    setDetail(transactionDetails);
    setDonators(parsedDonations);
  };

  useEffect(() => {
    if (contract) fetchDonators();
  }, [contract, address]);


  console.log(transactionTime)
  const handleDonate = async () => {
    // console.log(remainingDays)
    if (remainingDays != 0) {
      // console.log("clicked")
      setIsLoading(true);

      const dateBeforeTransaction = new Date();
      const timeBeforeTransaction = dateBeforeTransaction.getTime();
      const data = await donate(state.pId, amount);
      console.log("data", data);
      const dateAfterTransaction = new Date();
      const timeAfterTransaction = dateAfterTransaction.getTime();

      let timeInMilliSeconds = timeAfterTransaction - timeBeforeTransaction;

      const time = transactionCompletedTimeFunc(timeInMilliSeconds);

      alert(`Transaction Completed in ${time} !😁`)
      navigate("/");
      setIsLoading(false);
    } else {
      alert("Campaign Expired! 😶, you can't fund this campaign ")
    }
  };

  const handleDeleteCampaign = async () => {
    await deleteCampaign(state.pId);
    navigate("/");
  };

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img
            src={state.image}
            alt="campaign"
            className="w-full h-[410px] object-cover rounded-xl"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(
                  state.target,
                  state.amountCollected
                )}%`,
                maxWidth: "100%",
              }}></div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox
            title={`Raised of ${state.target}`}
            value={state.amountCollected}
          />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Creator
            </h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-[60%] h-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {state.owner}
                </h4>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Story
            </h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {state.description}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Donators
            </h4>

            <div className="mt-[20px] flex flex-col gap-4">
              {detail.length > 0 ? (
                detail.map((item, index) => (
                  
                    <div
                      key={`${item.donator}-${index}`}
                      className="flex justify-between items-center gap-4">
                     <a
                    href={`https://sepolia.etherscan.io/tx/${item.hash}`}
                    target="_blank"
                    rel="noopener noreferrer" className="p-[1px] border-b">
                      <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">
                        {index + 1}. {item.from}
                      </p>
                      </a>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">
                        {ethers.utils.formatEther(item.value)}
                      </p>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">
                        {formatDate(item.timeStamp)}
                      </p>
                    </div>
                
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
            <button
              className="font-epilogue font-semibold text-[18px] text-white uppercase rounded-[15px] bg-[#1dc071] mt-[20px] px-4 py-2"
              onClick={handleDeleteCampaign}>
              Delete Campaign
            </button>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
            Fund
          </h4>

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Back it because you believe in it.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the project for no reward, just because it speaks to
                  you.
                </p>
              </div>

              <CustomButton
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
