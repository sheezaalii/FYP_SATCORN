// NewSidebar.js
import React, { useState, useEffect } from "react";
import Axios from "axios";
// import ReactModal from "react-modal";
  


// Add CSS styles for the modal and backdrop
const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black backdrop
    zIndex: 1000, // Ensure modal appears on top
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    maxWidth: "80%",
    maxHeight: "80%",
    overflow: "auto",
    zIndex: 1001, // Ensure modal content appears above the backdrop
  },
};


function NewSidebar({
  polygonCoordinates,
  showForm, setShowForm,
  onDrawField,
  onDeletePolygon,
  onFarmSelection,
  isDrawing,
  initializeMapWithFields,
  setInfoPosition,
  setInfoResult,
  // updatePolygonColor,
  // ndviToColor,
  // selectedPolygonRef
  

}) {
  // <-- Add the isDrawing prop here
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the dropdown
  const [selectedOption, setSelectedOption] = useState(""); // State to track the selected option
  const [fieldName, setFieldName] = useState('');
  const [cropType, setCropType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDrawField = () => {
    setIsDrawingMode(true);
    onDrawField();
  };

  const [options, setoptions] = useState([
    {id: 12, farm_name: "Sheeza's Farm", latitude: '31.1137', longitude: '74.4672', user: 18},
    {id: 13, farm_name: 'Sample Farm', latitude: '25.3960', longitude: '68.3578', user: 18}
  ]);

  const [fields, setfields] = useState([
    {
      farm : 12,
      field_crop : "Corn",
      field_name: "Field 2",
      id : 4,
      coordinates :{
        0 : {lat: 123.45678, lng: 45.6891},
        1 : {lat: 123.45789, lng: 45.679123},
        2 : {lat: 123.458901, lng: 45.1679234}
      }
    },

    {
      farm : 12,
      field_crop : "Corn",
      field_name: "Field 6",
      id : 8,
      coordinates :{
        0 : {lat: 25.397793115994116, lng: 68.35967415019198},
        1 : {lat: 25.396823920750943, lng: 68.36057537242098},
        2 : {lat: 25.39631993614838, lng: 68.35971706553622}
      }
    }
  ])


  async function fetchFarms() {
    try {
      const response = await Axios.get('http://127.0.0.1:8000/api/get-farms', {
        withCredentials: true, // Include credentials
      });
      if (response.status === 200) {
        // Set the farms data in state
        console.log("The backend data is ", response.data);
        setoptions(response.data);

      } else {
        console.error('Failed to fetch farms');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }


  useEffect(() => {
    fetchFarms(); 
  }, [])


  const fetchfields = async (farmId) => {
    try {
        const response = await Axios.get(`http://127.0.0.1:8000/api/get-fields/${farmId}`, {
            withCredentials: true,
        });

        if (response.status === 200) {
            console.log('Fields for farm with ID ', farmId, response.data);
            setfields(response.data);
        } else {
            console.error('Failed to fetch farms');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
  

  const handleSave = async () => {
    const fieldName = document.getElementById("fieldName").value;
    const cropType = document.getElementById("cropType").value;

    // Convert the coordinates to the desired format
    const formattedCoordinates = polygonCoordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));

    const fieldData = {
        field_name: fieldName,
        field_crop: cropType,
        coordinates: formattedCoordinates,
        farm: selectedFarm.id, // Use the selected farm's ID or default to 1
    };

    try {
        const response = await Axios.post('http://127.0.0.1:8000/api/create-field', fieldData, {
            withCredentials: true,
        });

        console.log("Response from the server:", response.data);
        fetchfields(selectedFarm.id);

    } catch (error) {
        console.error("There was an error saving the field data:", error);
    }

    // Clear form data and hide the form
    setFieldName('');
    setCropType('');
    setShowForm(false);
    // onDeletePolygon(); // Remove the last drawn polygon
};



  const handleCancel = () => {
    onDeletePolygon(); // Remove the last drawn polygon
    // Clear form data and hide the form
    setFieldName('');
    setCropType('');
    setShowForm(false);

  };

  // Define the options for the dropdown
  const [selectedFarm, setSelectedFarm] = useState({
    id: null,
    latitude: null,
    longitude: null,
  }); 
  

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option.farm_name)
    setSelectedFarm({
      id: option.id,
      latitude: option.latitude,
      longitude: option.longitude,
    });

    fetchfields(option.id);

    async function fetchfields() {
      try {
        const response = await Axios.get(`http://127.0.0.1:8000/api/get-fields/${option.id}`, {
          withCredentials: true, // Include credentials
        });
        if (response.status === 200) {
          // Set the farms data in state
          console.log('Fields for farm with ID ',option.id, response.data);
          setfields(response.data);
          // setoptions(response.data);
  
        } else {
          console.error('Failed to fetch farms');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    

    fetchfields().then(() => {
      initializeMapWithFields(fields);
    });

    setIsDropdownOpen(false);

      // Call the parent component's callback function with latitude and longitude
      if (onFarmSelection) {
        onFarmSelection(option.latitude, option.longitude);
      }
    
  };
  

  const handleFieldClick = (polygonCoordinatesObj) => {
    // Convert the coordinates object to an array
    const polygonCoordinatesArray = Object.values(polygonCoordinatesObj).map(coord => ({ lat: coord.lat, lng: coord.lng }));

    let first_request_result;

    // Send the data to the server
    Axios.post("http://127.0.0.1:8000/api/Irrigated-model", {
        coordinates: polygonCoordinatesArray,
        withCredentials: true
    })
    .then(response => {
      if (response.data && polygonCoordinatesArray && polygonCoordinatesArray[0]) {
        first_request_result = response.data[0];



        // Send the data to the server
        Axios.post("http://127.0.0.1:8000/api/Classification-model", {
          coordinates: polygonCoordinatesArray,
          withCredentials: true
      })
      .then(response => {
        console.log('Data sent successfully:', response.data);
        if (response.data && response.data.result && polygonCoordinatesArray && polygonCoordinatesArray[0]) {
            // setInfoResult();
            let result_to_display = "The field conatins " + response.data.result + '<br>' + " Irrigation done " + first_request_result + " days ago.";
            // console.log("The first request result is ", first_request_result)
            setInfoResult(result_to_display);
            setInfoPosition(polygonCoordinatesArray[0]);  // Set to the first point of the polygon or any other desired point
          }
      })
      .catch(error => {
          console.error('Error sending data:', error);
      });



        
        }
    })
    .catch(error => {
        console.error('Error sending data:', error);
    });
};



  

  
  const handleDelete = (id) => {
    onDeletePolygon(); // Remove the last drawn polygon
    console.log("The recieved id is ", id);
    // Set up the URL with the provided ID
  const url = `http://127.0.0.1:8000/api/delete-field/${id}`;

  // Make a DELETE request to the server
  Axios.delete(url, {withCredentials: true})
    .then(response => {
      // Handle the successful deletion here
      console.log('Field deleted successfully', response.data);
      // If you need to perform state updates or any follow-up actions, do them here
      setFieldName('');
      setCropType('');
      setShowForm(false);
      window.location.reload();
    })
    .catch(error => {
      // Handle any errors here
      console.error('There was an error deleting the field', error);
    });
  };


  const dropdownContent = (
    <div className="relative z-10 mt-2 p-2 bg-white border rounded-md shadow" style={{ width: "60%"}}>
          
          <button
            onClick={onDrawField}
            className="text-white bg-blueGray-600 text-sm font-bold uppercase py-2 px-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all focus:ring focus:ring-blueGray-300"
            >
            Draw Field on Map
          </button>
          
          <button
            onClick={handleDrawField}
            className="text-white  bg-blueGray-600 text-sm font-bold uppercase py-2 px-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all focus:ring focus:ring-blueGray-300"
          >
            Upload Field (shp, etc)
          </button>


      </div>
    );

  


  
  return (
    <div
      style={{ width: "300px"}}
      className="absolute top-0 left-0 h-screen bg-white shadow-lg p-8 rounded-md opacity-90"
    >
       {showForm ? (
        // Render inputs and buttons for the drawn polygon
        <div>
          {/* Add other input fields and buttons here */}
          <label
            htmlFor="fieldName"
            className="block mt-2 text-sm text-gray-600"
          >
            Field Name
          </label>
          <input
            type="text"
            id="fieldName"
            className="w-full p-2 border rounded-md"
            placeholder="Enter field name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          
          />
          <label
            htmlFor="cropType"
            className="block mt-2 text-sm text-gray-600"
            
          >
            Crop Type
          </label>
          <select id="cropType" className="w-full p-2 border rounded-md"
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}>
            <option value="corn">Corn</option>
            <option value="cotton">Cotton</option>
            <option value="sugarcane">Sugarcane</option>
            {/* Add other crop options here */}
          </select>
          

          <div className="flex justify-end mt-4">
          
            <button
              onClick={handleCancel}
              className="bg-Green-400 text-black p-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-black p-2 rounded-md"
            >
              Save
            </button>
          </div>
        </div>

        ) : (
        
        <div className="flex-col">
        <div className="overflow-y-auto">
        <h1 className="text-center font-bold text-2xl mb-2">Fields</h1>
        <span className="text-blueGray-500 text-md font-semibold text-center">Select Farm First</span>

          <div className="relative inline-block text-center w-full">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle the dropdown when the button is clicked
              className="text-white bg-blueGray-700 hover:bg-blueGray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 w-full text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex"
              type="button"
              id="dropdownButton"
            >
             <span className="flex-grow">{selectedOption || "Select Farm"}</span>
              <svg
                className="w-2 h-2 ml-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="dropdownButton" tabIndex="-1">
                <div className="py-1" role="none">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        handleOptionSelect(option);
                       //handleFieldClick(); // Call the function to display and save farm data
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      {option.farm_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        {fields.length === 0 ? (
          <p>Please enter a farm to be displayed here.</p>
        ) : (
          <ul className="mt-8">
            {/* {console.log("Fields are ",fields)} */}
            {fields.map((field) => (
              <div key={field.id} className="mb-3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className="text-md font-semibold cursor-pointer"
                    onClick={() => {
                      handleFieldClick(field.coordinates);
                    }}
                  >
                    Field Name: {field.field_name}
                  </h3>
                  <button
                    onClick={() => {
                      handleDelete(field.id);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                <div>Crop: {field.field_crop}</div>
              </div>
            ))}

          </ul>
        )}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

      </div>

              <div className="fixed bottom-0 mb-4">
                <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={!selectedOption }
                    className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase py-2 px-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all focus:ring focus:ring-blue-300"
                    style={{ width: "60%"}}
                >
                    Create Fields
                </button>
                {showDropdown && dropdownContent}
              </div>
        </div>
      )}
    </div>
  );
}

export default NewSidebar;