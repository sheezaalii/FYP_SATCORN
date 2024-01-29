import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Axios from "axios";
import {Rings} from "react-loader-spinner";
import FooterSmall from "components/Footers/FooterSmall.js";
import { useHistory } from "react-router-dom";

export default function VerifyOTP() {
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("Please Enter Your OTP");

  const handleChangeOtp = (e) => {
    setOtp(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await Axios.post("http://127.0.0.1:8000/api/verify-otp", {
        otp: data.otp,
        email: data.email,
      });

      setLoading(false);

      if (response.status === 200) {
        if (response.data.message === "User verified successfully") {
          setSuccessMessage(response.data.message);
          setErrorMessage(null);
          history.push("/admin/maps")
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        
        }
        setErrorMessage(response.data.message);
        setSuccessMessage(null);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      } else {
        console.log("Error Response ", response);
        setErrorMessage(response.data.message);
        setSuccessMessage(null);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error1 Response ", error);
      setErrorMessage("Verification failed. Please try again.");
      setSuccessMessage(null);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <>
       {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <Rings color="#00BFFF" height={80} width={80} />
        </div>
      )}

      <div
        className="bg-cover bg-center min-h-screen"
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2017/06/11/02/05/wheat-2391348_1280.jpg')",
        }}
      >
        <main className="min-h-screen flex items-center">
          <div className="container mt-10 mx-auto px-4 h-full">
            <div className="flex content-center items-center justify-center h-full">
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                  <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                    <div className="text-blueGray-600 h-full text-center mb-4 mt-6 font-bold text-lg">
                      <span>VERIFY OTP</span>
                    </div>


                    <div className="text-white text-center mb-2">
                      {successMessage && (
                        <p className="bg-teal-500 bg-opacity-40 text-lg p-2 rounded-lg">
                          {successMessage}
                        </p>
                      )}
                    </div>
                    <div className="text-white text-center mb-2">
                      {errorMessage && (
                        <p className="bg-red-500 bg-opacity-40 text-lg p-2 rounded-lg">
                          {errorMessage}
                        </p>
                      )}
                    </div>



                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <input
                          required
                          {...register("email")}
                          name="email"
                          onChange={handleChangeEmail}
                          value={email}
                          type="email"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Email"
                        />
                      </div>



                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="otp"
                        >
                          Enter OTP
                        </label>
                        <input
                          required
                          {...register("otp")}
                          name="otp"
                          onChange={handleChangeOtp}
                          value={otp}
                          pattern="\d{5}"
                          type="text"
                          maxLength="5"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="5-digit OTP"
                        />
                      </div>


                      <div className="text-center mt-6">
                        <button
                          className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-8 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                          type="submit"
                        >
                          Verify
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <FooterSmall transparent />
      </div>
    </>
  );
}
