import React, { useState, useEffect } from 'react'
import { loader } from '../assets';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context'

const Profile = () => {
  const [isLoad, setIsLoad] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getUserCampaigns, isLoading } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoad(true);
    const data = await getUserCampaigns();
    setCampaigns(data);
    setIsLoad(false);
  }

  useEffect(() => {
    if (contract && !isLoading) fetchCampaigns();

  }, [address, contract, isLoading]);
  // console.log(campaigns, isLoading);



  return (
    <>
      {isLoading ? (
        <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
      ) : <DisplayCampaigns
        title="All Campaigns"
        isLoading={isLoad}
        campaigns={campaigns}
      />}
    </>

  )
}

export default Profile;