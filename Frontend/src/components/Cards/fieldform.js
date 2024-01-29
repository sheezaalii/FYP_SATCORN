import React, { useState } from 'react';

function FieldForm({ onStartDrawing, onSaveField }) {
  const [fieldName, setFieldName] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming getPolygonCoordinates is a prop function that returns the polygon coordinates
    console.log('Field Name:', fieldName);
    
    // Call onSaveField with the fieldName and polygonCoordinates if needed
    onSaveField(fieldName);
    
    // Clear the field name input
    setFieldName('');
  };

  return (
    <div className="absolute top-0 bottom-10 left-0 p-8 bg-white shadow-lg rounded-md opacity-90 w-12/12 h-full overflow-y-auto">
      <div>
            <h2 className="text-2xl font-bold mb-4 mt-4 text-center">Add Fields in your Farm</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
              <label htmlFor="farmName" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Field Name
              </label> 
              <input
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                id="fieldName"
                type="text"
                placeholder="Enter Field Name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
       </div>
      <div className="flex justify-between space-x-4">
          <button
            className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase py-2 px-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all focus:ring focus:ring-blue-300"
            onClick={() => onStartDrawing()}
          >
            Draw on Map
          </button>
          </div>
          <div className="flex justify-between space-x-4">

          <button
              type='submit'
              className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase py-2 px-4 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all focus:ring focus:ring-blue-300"
              onClick={() => {
                onSaveField(fieldName);
                setFieldName('');
              }}
            >
              Save Field
          </button>
        
      </div>
      </form>
    </div>
    </div>
  );
}

export default FieldForm;
