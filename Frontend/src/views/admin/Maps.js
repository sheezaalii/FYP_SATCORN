import React from "react";



// components

import MapExample from "components/Maps/MapExample.js";
import NewSidebar from "components/Maps/NewSidebar";

export default function Maps() {
  
  return (
    <>
      <div className="relative flex w-full">
        <div className=" relative w-6/14 p-0">
          <NewSidebar />
        </div>
        <MapExample className="map-container rounded h-screen  z-0" />
      </div>
    </>
  );
}
