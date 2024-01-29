import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import ReactModal from "react-modal";


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
    maxHeight: "100%",
    height: "60%",

    overflow: "auto",
    zIndex: 1001, // Ensure modal content appears above the backdrop
  },
};

export default function Season({ seasonData, isModalOpen, setIsModalOpen, seasonId  }) {
  console.log("The season data recived is ", seasonData);
  
  const initialFormData = seasonData ? {
    seasonName: seasonData.season_name || "",
    startDate: seasonData.start_date ? new Date(seasonData.start_date) : null,
    endDate: seasonData.end_date ? new Date(seasonData.end_date) : null
  } : {
    seasonName: "",
    startDate: null,
    endDate: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [name, setName] = useState(seasonData ? seasonData.season_name : '');
  const [startDate, setStartDate] = useState(seasonData ? seasonData.start_date : '');
  const [endDate, setEndDate] = useState(seasonData ? seasonData.end_date : '');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    
    setName(value)
  };
  

  // Handle date changes
  const handleStartDateChange = (date) => {
    let day = new Date(date).getDate();
    let month = (new Date(date).getMonth()) + 1;
    let year = new Date(date).getFullYear();
    let dateString = year+"-"+month+"-"+day;
    setStartDate(dateString);

  setFormData({
    ...formData,
    startDate: date
  });
  };

  const handleEndDateChange = (date) => {
    let day = new Date(date).getDate();
    let month = (new Date(date).getMonth())+1;
    let year = new Date(date).getFullYear();
    let dateString = year+"-"+month+"-"+day;
    console.log(dateString);
    setEndDate(dateString);

    setFormData({
      ...formData,
      endDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = {
      season_name: name, 
      start_date: startDate, 
      end_date: endDate, 
    };

    let requestUrl;
    let requestMethod;

    if (seasonId) {
      // If the season ID is available, then it's an update operation
      requestUrl = `http://127.0.0.1:8000/api/update-season/${seasonId}`;
      requestMethod = 'POST';  // Or 'PATCH' if your API requires
    } else {
      // Else, it's a create operation
      requestUrl = 'http://127.0.0.1:8000/api/create-season';
      requestMethod = 'POST';
    }
    console.log("Sending to submit form data is ", formDataToSend);

    try {
      const response = await axios({
        url: requestUrl,
        method: requestMethod,
        data: formDataToSend,
        withCredentials: true, // Include credentials in the request
      });
  
      if (response.status !== 201) {
        console.log('Error:', response.data);
        // Close the modal after a successful operation
        setIsModalOpen(false);
        window.location.reload();
      } else {
        console.log('Response:', response.data);
        // Close the modal after a successful operation
        setIsModalOpen(false);
      }
      // Handle the response as needed
    } catch (error) {
      console.error('Error:', error);
      // Handle errors
    }
  };
  


  const handleDelete = async () => {
    try {
        if (seasonData && seasonData.id) {
            const response = await axios.delete(`http://127.0.0.1:8000/api/delete-season/${seasonData.id}`, {
                withCredentials: true,
            });
            if (response.status === 200) {
                console.log('Successfully deleted:', response.data);
                setIsModalOpen(false);
                window.location.reload();
            } else {
                console.error('Error during deletion:', response.data);
            }
        } else {
            console.error('No season ID provided for deletion');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};




  const handleCancel = () => {
    // Reset the form data to its initial state
    setFormData(initialFormData);
    // Disable the Cancel button
    setCancelDisabled(true);
  };

  // Add a new state variable to manage the "Cancel" button's disabled state
  const [cancelDisabled, setCancelDisabled] = useState(false);


  // Define the modal content
  const modalContent = (
    <div className="relative">
      <button
      onClick={() => setIsModalOpen(false)}
      className="absolute top-0 right-0 mt-0 mr-0 bg-transparent border-0 text-black hover:text-gray-500 text-2xl leading-none outline-none focus:outline-none"
      >
        <span>&times;</span>
      </button>

      <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <h2 className="text-2xl font-bold mb-4 mt-4 text-center">
                  {seasonData ? "Update Season" : "Create Season"}
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="seasonName"
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      >
                        Season Name
                      </label>
                      <input
                        type="text"
                        id="seasonName"
                        name="seasonName"
                        value={formData.seasonName}
                        onChange={handleInputChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Enter Season Name"
                        required
                      />
                    </div>

                    <div className="md:flex md:space-x-4">
                      {/* Start Date */}
                      <div className="w-1/2 pr-2">
                        <label
                          htmlFor="start"
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        >
                          Start Date
                        </label>
                        <div className="relative flex items-center md:w-1/2">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
                              />
                            </svg>
                          </div>
                          <DatePicker
                            name="startDate"
                            selected={formData.startDate}
                            onChange={handleStartDateChange}
                            className="bg-gray-50 border-1 border-blueGray-100 placeholder-blueGray-300 text-blueGray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholderText="Select date start"
                          />
                        </div>
                      </div>

                      <div className="w-1/2 pr-2">
                        <label
                          htmlFor="end"
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        >
                          End Date
                        </label>
                        <div className="relative flex items-center md:w-1/2">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
                              />
                            </svg>
                          </div>
                          <DatePicker
                            name="endDate"
                            selected={formData.endDate}
                            onChange={handleEndDateChange}
                            className="bg-gray-50 border-1 border-blueGray-100 placeholder-blueGray-300 text-blueGray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholderText="Select date end"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Buttons Container */}
                    <div className="flex justify-between mt-6">
                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-slate-500 text-white active:bg-red-300 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="bg-sky-600 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                    >
                        {seasonData ? "Update Season" : "Create Season"}
                    </button>

                    {/* Conditionally rendered Delete Button */}
                    {seasonData && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white active:bg-red-300 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                        >
                            Delete
                        </button>
                    )}
                    </div>
                  </form>
                </div>

      </div>
    );

  return (
    <>
      <ReactModal
         isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={modalStyles} // Apply the custom styles
          >            
      {modalContent}
    </ReactModal>
    </>
  );
}