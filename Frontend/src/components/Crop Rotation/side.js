import React, { useEffect, useRef, useState } from "react";
import ReactModal from "react-modal"; // Import react-modal
import Axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
function Side({ selectedSeason, selectedFarm , FormsData }) {
    
  

  const initialFormData = FormsData ? {
    cropName: FormsData.crop_name || "",
    plantingDate: FormsData.plant_date ? new Date(FormsData.plant_date) : null,
    harvestingDate: FormsData.harvest_date ? new Date(FormsData.harvest_date) : null,
    cropVariety: FormsData.crop_variety|| "",
  } : {
    cropName: "",
    plantingDate: null,
    harvestingDate: null,
    cropVariety: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [name, setName] = useState(FormsData ? FormsData.crop_name : '');
  const [plantingDate, setPlantDate] = useState(FormsData ? FormsData.plant_date : '');
  const [harvestingDate, setHarvestDate] = useState(FormsData ? FormsData.harvest_date : '');
  const [cropVariety, setvariety] =useState(FormsData ? FormsData.crop_variety : '')
  const [cropRotations, setCropRotations] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedField, setSelectedField] = useState(null);



 // changing handlesubmit to access dummy data for now
  const handleSubmit = async (e) => {
      e.preventDefault();

      const dataToSend = {
          crop_name: formData.cropName,
          planting_date: formData.plantingDate ? formData.plantingDate.toISOString().split('T')[0] : null,
          harvesting_date: formData.harvestingDate ? formData.harvestingDate.toISOString().split('T')[0] : null,
          crop_variety: formData.cropVariety
      };

      try {
          let response;
          if (modalMode === 'add') {
              response = await Axios.post("http://127.0.0.1:8000/api/create-crop-rotation", {
                  ...dataToSend,
                  season: selectedSeason?.id,
                  field: selectedField
              }, {
                  withCredentials: true
              });
          } else if (modalMode === 'edit' && selectedSeason && selectedField) {
              response = await Axios.post(`http://127.0.0.1:8000/api/update-crop-rotation/${selectedSeason?.id}/${selectedField}`, dataToSend, {
                  withCredentials: true
              });
          }
          
          if (response.status === 200) {
              console.log("Data successfully processed!");
          }
      } catch (error) {
          console.error("Error processing data:", error);
      }

      setIsModalOpen(false)
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formDataToSend = {
  //     crop_name: name, 
  //     plant_date: plantingDate, 
  //     harvest_date: harvestingDate, 
  //     crop_variety: cropVariety
  //   };

  //   console.log("Sending to submit form data is ", formDataToSend);
  //   setIsModalOpen(false)
  // }



  const handleCancel = () => {
    // Reset the form data to its initial state
    setFormData(initialFormData);
    // Disable the Cancel button
    setIsModalOpen(false)
  };

  // Input Change Handlers
const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
        ...prevState,
        [name]: value,
    }));
};

// Date Change Handlers
const handlePlantDateChange = (date) => {
    setFormData(prevState => ({
        ...prevState,
        plantingDate: date,
    }));
};

const handleHarvestDateChange = (date) => {
    setFormData(prevState => ({
        ...prevState,
        harvestingDate: date,
    }));
};

const handleDelete = async () => {
  try {
      const response = await Axios.get(`http://127.0.0.1:8000/api/delete-crop-rotation/${currentEditIndex}`, {
          withCredentials: true
      });
      if (response.status === 200) {
          console.log("Successfully deleted!");
          
      }
  } catch (error) {
      console.error("Error deleting data:", error);
  }
  setIsModalOpen(false);
}
  //dummy fields 
  // const [fields, setFields] = useState([
  //   [
  //     {
  //         "id": 4,
  //         "field_name": "Field 2",
  //         "coordinates": [
  //             {
  //                 "latitude": 123.45678,
  //                 "longitude": 45.6891
  //             },
  //             {
  //                 "latitude": 123.45789,
  //                 "longitude": 45.679123
  //             },
  //             {
  //                 "latitude": 123.458901,
  //                 "longitude": 45.1679234
  //             }
  //         ],
  //         "farm": 12,
  //         "field_crop": "Corn"
  //     },
  //     {
  //         "id": 5,
  //         "field_name": "Field 4",
  //         "coordinates": [
  //             {
  //                 "lat": 123.45678,
  //                 "lng": 45.6891
  //             },
  //             {
  //                 "lat": 123.45789,
  //                 "lng": 45.679123
  //             },
  //             {
  //                 "lat": 123.458901,
  //                 "lng": 45.1679234
  //             }
  //         ],
  //         "farm": 12,
  //         "field_crop": "Corn"
  //     }
  // ]
  // ]);

    // for now 'dummy data is used'
    const [fields, setFields] = useState(FormsData || []);
    useEffect(() => {
        if (FormsData) {
            setFields(FormsData);
        }
    }, [FormsData, isModalOpen]);


    async function fetchCropRotations(seasonId, fieldId) {
      try {
          const response = await Axios.get(`http://127.0.0.1:8000/api/get-crop-rotations/${seasonId}/${fieldId}`, {
              withCredentials: true
          });
          return response.data;
      } catch (error) {
          console.error("Failed fetching crop rotations:", error);
          return null;
      }
  }


  useEffect(() => {
    async function fetchData() {
      const seasonId = selectedSeason?.id;
      if (!seasonId || !fields.length) return;
  
      const rotations = await Promise.all(fields.map(field => fetchCropRotations(seasonId, field.id)));
      setCropRotations(rotations);
    }
  
    fetchData();
  }, [fields, selectedSeason, isModalOpen]);

  const handleEdit = (index, id) => {
    setEditMode(true);
    setCurrentEditIndex(id);
    const rotation = cropRotations[index];
    if (rotation) {
      // Set form data to edit
      setFormData({
        cropName: rotation.crop_name,
        plantingDate: new Date(rotation.planting_date),
        harvestingDate: new Date(rotation.harvesting_date),
        cropVariety: rotation.crop_variety
      });
    }
    setIsModalOpen(true);
  };
  

  
  

const modalContent = (
    <div className="relative">
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-0 right-0 mt-0 mr-0 bg-transparent border-0 text-black hover:text-gray-500 text-2xl leading-none outline-none focus:outline-none"
        >
            <span>&times;</span>
      </button>

        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
            <h2 className="text-2xl font-bold mb-4 mt-2 text-center">ADD CROP</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="cropName"
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    >
                        Crop Name
                    </label>
                    <input
                        type="text"
                        id="cropName"
                        name="cropName"
                       value={formData.cropName}
                        onChange={handleInputChange}
                        className="border-0 px-3 py-3 mb-4 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Enter Crop Name"
                        required
                      />
                </div>

                <div className="md:flex md:space-x-4">
                    <div className="w-1/2 pr-2">
                         <label
                          htmlFor="planting"
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        >
                          Planting Date
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
                            name="plantingDate"
                            selected={formData.plantingDate}
                            onChange={handlePlantDateChange}
                            className="bg-gray-50 border-1 mb-4 border-blueGray-100 placeholder-blueGray-300 text-blueGray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholderText="Select planting start"
                          />
                        </div>
                    </div>
                    <div className="w-1/2 pr-2">
                    <label
                          htmlFor="harvesting"
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        >
                          Harvesting Date
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
                            name="harvestingDate"
                            selected={formData.harvestingDate}
                            onChange={handleHarvestDateChange}
                            className="bg-gray-50 border-1 mb-4 border-blueGray-100 placeholder-blueGray-300 text-blueGray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholderText="Select harvesting start"
                          />
                        </div>
                    </div>

                </div>

                <div>
                    <label
                        htmlFor="cropVar"
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    >
                        Crop Variety
                    </label>
                    <input
                        type="text"
                        id="cropVar"
                        name="cropVariety"
                       value={formData.cropVariety}
                        onChange={handleInputChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Your Crop Variety"
                        required
                      />
                </div>
                <div className="flex justify-between mt-6">
                    {/* Cancel Button */}
                    
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-slate-500 text-white active:bg-red-300 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                      >
                        Cancel
                    </button>
                    {modalMode === 'edit' && (
                          <button
                              type="button"
                              onClick={handleDelete} 
                              className="bg-red-500 text-white active:bg-red-300 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                          >
                              Delete
                          </button>
                      )}
                    {modalMode === 'edit' ? (
                        <button
                            type="submit"
                            className="bg-sky-600 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                        >
                            Update
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="bg-sky-600 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-1 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-6/12 h-10 transition-all ease-in-out duration-200"
                        >
                            Submit
                        </button>
                    )}

                </div>
            </form>
                
        </div>
    </div>
)

  return (
    <>
    <div className="flex h-screen w-full mt-4">
        <div className="fields-container relative rounded h-auto p-4 bg-white shadow-md" style={{width: "40%"}}>
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-xl font-bold">{selectedFarm?.farm_name || "Farm Name"}</h2>
            </div>

            <div className="my-2 flex justify-center items-center ">
                <span>Your Fields</span>
            </div>
                
                {fields.map((field) => (
                  <div key={field.id} className="p-2 bg-lightBlue-200 flex justify-center items-center rounded mb-4">
                      {field.field_name}
                  </div>
                ))}
              
            
        </div>

        <div className="season-container relative rounded h-auto p-4 bg-white shadow-md" style={{width: "50%"}}>
              <div className="flex justify-center items-center mb-4">
              <h2 className="text-xl font-bold">{selectedSeason?.season_name || "Season"}</h2>
              </div>

              <div className="flex my-2 justify-center items-center ">
                  <span>Start Date: {selectedSeason?.start_date}</span>
                  <span className="mx-4">End Date: {selectedSeason?.end_date}</span>
              </div>

              {fields.map((field, index) => {
                  const rotation = cropRotations[index];
                  return (
                      <div
                          key={field.id}
                          onMouseEnter={() => setHoveredRow(index)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="p-2 bg-emerald-200 rounded mb-4 flex justify-center items-center"
                      >
                          {hoveredRow === index ? 
                              rotation && rotation.crop_name ? (
                                  <div className="flex flex-col">
                                      <span>
                                          {rotation.crop_name}
                                          <span className="ml-2">({rotation.planting_date} to {rotation.harvesting_date})</span>
                                          <span className="text-xs mt-1">   Crop Variety: {rotation.crop_variety}</span>
                                      </span>
                                      <button 
                                          className="bg-blueGray-600 text-white px-2 py-0.5 rounded mt-2"
                                          onClick={() => {handleEdit(index, rotation.id);setModalMode('edit');}}
                                      >
                                          Edit Crop
                                      </button>
                                  </div>
                              ) : (
                                  <button
                                      className="text-black px-2 py-0.5 rounded"
                                      onClick={() => {setIsModalOpen(true);setModalMode('add');setFormData({cropName: "",plantingDate: null,harvestingDate: null,cropVariety: ""});setSelectedField(field.id)}}
                                  >
                                      +Add Crop
                                  </button>
                              )
                          : rotation && rotation.crop_name ? (
                              <div className="flex flex-col">
                                  <span>
                                      {rotation.crop_name}
                                      <span className="ml-2">({rotation.planting_date} to {rotation.harvesting_date})</span>
                                      <span className="text-xs">Crop Variety: {rotation.crop_variety}</span>
                                  </span>
                              </div>
                          ) : (
                              <span>None</span>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>
      <ReactModal
         isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={modalStyles}
          >            
      {modalContent}
    </ReactModal>
    </>
  );
}
export default Side;