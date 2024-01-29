import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Navbar from "components/Navbars/AuthNavbar.js";
import Login from "views/auth/Login.js";
import Register from "views/auth/Register.js";
import VerifyOtp from "views/auth/VerifyOTP.js";
import Logout from "views/auth/Logout.js";


export default function Auth() {
  
  return (
    <>
      <Navbar transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage:
                "url(" + require("assets/img/register_bg_2.png").default + ")",
            }}
          ></div>
          <Switch>
            <Route path="/login" exact component={Login} />
            <Route path="/register" exact component={Register} />
            <Route path="/verifyotp" exact component={VerifyOtp} />
            <Route path="/logout" exact component={Logout} />
            <Redirect from="/" to="/login" />
          </Switch>
        </section>
      </main>
    </>
  );
}
