import React, { useEffect, useState } from "react";
import ReactModal from "react-modal"; // Import react-modal
import DatePicker from "react-datepicker";
import Axios from "axios";

//import Axios from "axios";
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
function Right({ selectedFieldId }) {  // Accept the selectedFieldId as a prop
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        due_date: null, // Initialize with the current date or null if you prefer
        status: 'Pending', // Assuming default status is 'Pending'
        field: selectedFieldId || null // Ensure to have a valid field id or null
      });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        const dueDate = new Date(formData.due_date);
        if (!dueDate.getTime()) { // getTime() is NaN if the date is invalid
            console.error("Invalid due date", formData.due_date);
            // handle invalid date
            return;
        }
          formData.name = formData.cropName;
          formData.field = selectedFieldId;
          console.log(`Posting data is  ${formData.due_date.getFullYear()}-${formData.due_date.getMonth() + 1}-${formData.due_date.getDate()}`);
        try {
          const response = await Axios.post('http://127.0.0.1:8000/api/CreateJob', {
            name: formData.name,
            field: formData.field,
            due_date: `${formData.due_date.getFullYear()}-${formData.due_date.getMonth() + 1}-${formData.due_date.getDate()}`,
            status: "Pending"
          }, {
            withCredentials: true
          });
          console.log(response.data);
          // Handle the response, update state, close modal, etc.
          setIsModalOpen(false); // Close the modal on success
          // Fetch the updated list of jobs, if necessary
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle errors, such as displaying a message to the user
        }
      };
      
    const handleCancel = () => {
        if(isModalOpen){
            setIsModalOpen(false);
        }
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
      
    const handleDelete = async () => {
    }
    const handleEdit = (index, id) => {
    }
    const handlePlantDateChange = (date) => {
        setFormData(prevState => ({
          ...prevState,
          due_date: date
        }));
      };

      // Define a function to reset the form data to its initial state
    const resetFormData = () => {
        setFormData({
            name: '',
            due_date: null, // or new Date() if you want to initialize with the current date
            status: 'Pending',
            field: selectedFieldId || null
        });
    };

      // Call this function when you want to close the modal
    const handleCloseModal = () => {
        resetFormData(); // Reset the form data
        setIsModalOpen(false); // Close the modal
    };

    // Call this function when you want to open the modal for adding a new job
    const handleOpenModalForAdd = () => {
        resetFormData(); // Ensure form is reset
        setModalMode('add'); // Set mode to 'add'
        setIsModalOpen(true); // Open the modal
    };
      

    useEffect(() => {
        if (!selectedFieldId) return; // Don't fetch if no field is selected
        console.log("Selcted field is ", selectedFieldId);
        async function fetchJobs() {
            try {
                const jobsResponse = await Axios.get(`http://127.0.0.1:8000/api/Jobs`, {
                    withCredentials: true
                });
                const relatedJobs = jobsResponse.data.filter(job => job.field === selectedFieldId);
                console.log("Related jobs are ", relatedJobs);
                setTasks(relatedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        }

        fetchJobs();
    }, [selectedFieldId, isModalOpen]);  // This effect runs every time selectedFieldId changes

    async function MarkComplete(id){
        // Create the dynamic URL using the `id`
        const url = `http://127.0.0.1:8000/api/UpdateJobStatus/${id}`;
    
        try {
            // Use Axios to send a PUT request to the URL with withCredentials
            // Notice the method should match the type of request expected by your API (PUT for update, POST for create)
            const response = await Axios.post(url, {}, {
                withCredentials: true
            });
            
            console.log("Job status updated successfully!", response.data);
            
            // If you're updating the job status, you might want to update the list of jobs or the UI in some way.
            // For example:
            // fetchJobs(); // A hypothetical function to refresh the list of jobs.
            
            setIsModalOpen(true); // You might want to keep the modal open if there's an error or handle it differently.
            setIsModalOpen(false); // Close the modal on success
        } catch (error) {
            console.error("There was an error updating the job status!", error);
        }
    }



    const modalContent = (
        <div className="relative">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-0 right-0 mt-0 mr-0 bg-transparent border-0 text-black hover:text-gray-500 text-2xl leading-none outline-none focus:outline-none"
            >
                <span>&times;</span>
          </button>
    
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <h2 className="text-2xl font-bold mb-4 mt-2 text-center">ADD NEW JOB</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="cropName"
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        >
                            Job Title
                        </label>
                        <input
                            type="text"
                            id="cropName"
                            name="cropName"
                        //    value={formData.cropName}
                            onChange={handleInputChange}
                            className="border-0 px-3 py-3 mb-4 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Enter Crop Name"
                            required
                          />
                    </div>
                    
    
                    <div className="md:flex md:space-x-4">
                        <div className="pr-2">
                             <label
                              htmlFor="planting"
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            >
                              Due Date
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
                                selected={formData.due_date}
                                onChange={handlePlantDateChange}
                                className="bg-gray-50 border-1 mb-4 border-blueGray-100 placeholder-blueGray-300 text-blueGray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                placeholderText="Select planting start"
                              />
                            </div>
                        </div>
                        
    
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
            {/* <div className="relative flex w-full">
                {tasks.map(task => (
                    <div key={task.id} className="border p-4 m-2 rounded-md">
                        <h3 className="font-bold text-xl">{task.name}</h3>
                        <p>Due Date: {task.due_date}</p>
                        <p>Status: {task.status}</p>
                    </div>
                ))}
            </div> */}
            <div className="w-full h-full p-4">
                <div className="flex justify-between bg-lightBlue-800 m-2">
                    <div className="font-bold p-4 ml-4 w-1/4 text-white items-center justify-center ml-2">Name</div>
                    <div className="font-bold p-4 w-1/4 text-white items-center justify-center ml-2">
                    Due Date
                    </div>
                    <div className="font-bold p-4 w-1/4 text-white items-center justify-center mr-1">
                    Status
                    </div>
                    <div className="font-bold p-4  w-1/4 text-white items-center justify-center mr-10">Check</div>

                </div>
                
                {tasks.map(task => (
                    <div key={task.id} className={`flex justify-between border border-lightBlue-700 m-2 rounded-md p-4 ${task.status === 'Completed' ? 'bg-green-400' : 'bg-red-400'}`}>
                    <div className="w-1/3 p-4 bg-blue-200">{task.name}</div>
                    <div className="w-1/3 p-4 mr-8">{task.due_date}</div>
                    <div className={`w-1/4 p-2 mx-3 text-center text-black font-semibold rounded-md shadow ${task.status === 'Completed' ? 'bg-green-400' : 'bg-red-400'}`}>
                        {task.status}
                    </div>
                    <div className="w-1/3 p-4">
                    <button
                        className={`text-black px-4 py-4 border ${task.status === 'Completed' ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-green-500 bg-emerald-50'} rounded-md shadow-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-opacity-50`}
                        onClick={() => MarkComplete(task.id)}
                        disabled={task.status === 'Completed'}
                    >
                            Mark Complete
                        </button>
                    </div>
                    </div>
                    
                ))}

            <div className="flex justify-between border border-lightBlue-700 m-2 rounded-md p-4">
                <button className="text-black px-2 py-1  bg-lightBlue-200 rounded ml-1" onClick={handleOpenModalForAdd}>
                + Add New Job 
                </button>
            </div>
                
            </div>

        <ReactModal
         isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        style={modalStyles} // Apply the custom styles
          >            
      {modalContent}
    </ReactModal>
        </>
    );
}

export default Right;