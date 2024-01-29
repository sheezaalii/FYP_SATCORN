import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Axios from "axios";
import { useHistory } from "react-router-dom";



// components

import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";

// views

import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Farms from "views/admin/Farms.js";
import Weather from "views/admin/Weather.js";
import Croprotation from "views/admin/Croprotation.js";
import Jobs from "views/admin/Jobs";

export default function Admin() {
  const [isSidebarToggled, setIsSidebarToggled] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // Check if the user is already logged in
    async function checkUserLogin() {
      try {
        const response = await Axios.get('http://127.0.0.1:8000/api/user', {
          withCredentials: true, // Include cookies with the request
        });
    
        if (response.status === 200) {
          console.log("Yes, you are logged in", response);
        }
      } catch (error) {
        console.log("No, you are not logged in");
        history.push("/login");
      }
    }

    checkUserLogin();
  }, [history]);

  return (
    
    <>
      <Sidebar onToggleSidebar={setIsSidebarToggled} />

      <div
        className={`relative ${
          isSidebarToggled ? "md:ml-64" : "md:ml-34"
        } bg-white-100`}
      >
        <Switch>
          <Route path="/admin/croprotation" exact component={Croprotation} />
          <Route path="/admin/maps" exact component={Maps} />
          <Route path="/admin/settings" exact component={Settings} />
          <Route path="/admin/farms" exact component={Farms} />
          <Route path="/admin/weather" exact component={Weather} />
          <Route path="/admin/jobs" exact component={Jobs} />
          <Redirect from="/admin" to="/admin/dashboard" />
        </Switch>
      </div>
    </>
  );
}