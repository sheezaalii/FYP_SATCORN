/* global google */
import React, { useEffect, useRef, useState } from "react";
import Farmform from "components/Farm/Farmform.js";

function GopMap() {
  const mapRef = useRef(null);
  const [marker, setMarker] = useState(null);
  const [polygonMap, setPolygonMap] = useState(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);

  const apiKey = "AIzaSyDpo-ZoNkacwalqscODE_KNkvKE_2KkYK0";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing`;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 28.486753029366852, lng: 70.0956817623839 },
        zoom: 17,
        mapTypeId: "satellite",
      });
      setPolygonMap(map);
    });

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  useEffect(() => {
    if (polygonMap) {
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          // Set polygon options here
          strokeColor: "#FFFF00", 
          fillColor: "#FFFF00", 
        },
      });
      drawingManager.setMap(polygonMap);

      // drawingManager.addListener("polygoncomplete", (polygon) => {
      //   // Assuming setSelectedPolygon exists or replace with appropriate logic
      //   setSelectedPolygon(polygon);
      // });
    }
  }, [polygonMap]);

  return (
    <>
      <div className="relative flex w-full">
        <div className="relative w-6/13 p-0">
            <Farmform onLocationChange={(lat, lng) => {
                polygonMap.setCenter(new google.maps.LatLng(lat, lng));
            }} />
        </div>
        <div
            id="map"
            className="map-container rounded h-screen flex-grow relative z-0"
            ref={mapRef}
        />
      </div>

    </>
  );
}

export default GopMap;
