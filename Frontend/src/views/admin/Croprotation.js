import React, { useEffect, useState } from "react";
import Axios from 'axios';
import Cropfieldform from "components/Crop Rotation/Cropfieldform";
import Side from "components/Crop Rotation/side";


function Cropsrotation() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [fields, setFields] = useState([]);
  const [seasonDetails, setSeasonDetails] = useState([]);

  useEffect(() => {
    async function fetchFields() {
      if (selectedFarm) {
        
        try {
          const response = await Axios.get(`http://127.0.0.1:8000/api/get-fields/${selectedFarm.id}`, {
            withCredentials: true
          });
          setFields(response.data);  
        } catch (error) {
          console.error("Error fetching fields:", error);
        }
      }
    }

    fetchFields();
  }, [selectedFarm]);

  useEffect(() => {
    async function fetchSeasonDetails() {
      if (selectedSeason) {
        console.log("Calling backend with ", selectedSeason);
        try {
          const response = await Axios.get(`http://127.0.0.1:8000/api/get-seasons/${selectedSeason.id}`, {
            withCredentials: true
          });
          setSeasonDetails(response.data);
          console.log("Variable saved the data ", seasonDetails);
        } catch (error) {
          console.error("Error fetching season details:", error);
        }
      }
    }

    fetchSeasonDetails();
  }, [selectedSeason]);

  return (
    <div className="relative flex w-full">
        <div className="relative w-6/14 p-0">
          <Cropfieldform 
          onSeasonSelect={setSelectedSeason}
          selectedSeason={selectedSeason}
          onFarmSelect={setSelectedFarm}
          selectedFarm = {selectedFarm}
          />
        </div>
        <Side 
        selectedSeason={selectedSeason} 
        selectedFarm={selectedFarm}
        FormsData={fields}
        SeasonDetails={seasonDetails}
        />
        
    </div>
);
}

export default Cropsrotation;