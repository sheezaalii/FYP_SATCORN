import React, { useEffect, useState } from "react";
import Axios from "axios";

function Left({setSelectedFieldId}){
    const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [selectedFieldOption, setSelectedFieldOption] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [fieldsDetails, setFieldsDetails] = useState([]);

    //farms
  const [options, setoptions] = useState([
    {id: 12, farm_name: "Sheeza's Farm", latitude: '31.1137', longitude: '74.4672', user: 18},
    {id: 13, farm_name: 'Sample Farm', latitude: '25.3960', longitude: '68.3578', user: 18}
  ]);

  //seasons
  const [seasonDetails, setSeasonDetails] = useState([
    {
      id: 2,
      user: 18,
      season_name: "Summer Season",
      start_date: "2023-05-01",
      end_date: "2023-08-31"
  },
  {
      id: 8,
      user: 8,
      season_name: "Winter Season",
      start_date: "2023-01-01",
      end_date: "2023-04-31"
  }
]);


useEffect(() => {
    async function fetchFarms() {
      try {
        const farmsResponse = await Axios.get("http://127.0.0.1:8000/api/get-farms", {
          withCredentials: true
        });
        setoptions(farmsResponse.data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    }
  
    fetchFarms();
  }, []); // Empty dependency array ensures this effect runs once when component mounts

  

useEffect(() => {
    if (!selectedOption) return;

    async function fetchFields() {
        try {
            const farmId = options.find(o => o.farm_name === selectedOption).id;
            const fieldsResponse = await Axios.get(`http://127.0.0.1:8000/api/get-fields/${farmId}`, {
                withCredentials: true
            });
            setFieldsDetails(fieldsResponse.data);
        } catch (error) {
            console.error("Error fetching fields:", error);
        }
    }

    fetchFields();
}, [selectedOption, options]);
  

// This will be called when a farm is selected
const handleOptionSelect = (option) => {
    setSelectedOption(option.farm_name);
    
    setIsFarmDropdownOpen(false);
};

  // Handle field Selection 
const handleFieldChange = (fieldOption) => {
    // logic for when a field is selected
    setSelectedFieldId(fieldOption.id);
    setSelectedFieldOption(fieldOption.field_name);
    setIsSeasonDropdownOpen(false);
};

    return(
        <>
            <div style={{ width: "300px" }} className="absolute top-0 z-0 left-0 p-8 bg-white h-screen shadow-lg rounded-md opacity-100 h-screen">
            <h2 className="text-2xl font-bold mb-4 mt-4 text-center">Job Activity</h2>
            <span className="text-blueGray-500 text-md font-semibold text-center">Please Select Your Farm</span>
            {/* ... (Farm Dropdown Logic using farms state) ... */}
            <div className="relative inline-block text-center w-full">
                <button onClick={() => { setIsFarmDropdownOpen(!isFarmDropdownOpen); setIsSeasonDropdownOpen(false); }} className="mt-2 mb-2 text-white bg-blueGray-700 hover:bg-lightBlue-200 hover:text-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 w-full text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex" type="button" id="dropdownButton">
                <span className="flex-grow">{selectedOption || "Select Farm"}</span>
                {/* SVG remains the same */}
                </button>
                {isFarmDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="dropdownButton" tabIndex="-1">
                    <div className="py-1" role="none">
                        {/* replacing farms with options for dummy data to pick */}
                        {options.map((option) => (
                            <button key={option.id} onClick={() => handleOptionSelect(option)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">{option.farm_name}</button>
                        ))}
                    </div>
                </div>
                )}
            </div>

            <span className="mt-2 text-blueGray-500 text-md font-semibold text-center">Please Choose Season</span>
            {/* ... (Season Dropdown Logic using seasons state) ... */}
            <div className="relative inline-block text-center w-full">
                <button onClick={() => { setIsSeasonDropdownOpen(!isSeasonDropdownOpen); setIsFarmDropdownOpen(false); }} disabled={!selectedOption} className="mt-2 text-white bg-blueGray-700 hover:bg-emerald-200 hover:text-emerald-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 w-full text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex" type="button" id="dropdownButton">
                <span className="flex-grow">{selectedFieldOption || "Select Field"}</span>
                {/* SVG remains the same */}
                </button>
                {isSeasonDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="dropdownButton" tabIndex="-1">
                        <div className="py-1" role="none">
                            {fieldsDetails.map((fieldOption) => (
                                <button key={fieldOption.id} onClick={() => handleFieldChange(fieldOption)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">{fieldOption.field_name}</button>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            </div>


        </>
    );
}

export default Left;