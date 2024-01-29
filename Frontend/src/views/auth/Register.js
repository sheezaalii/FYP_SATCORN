import React, {useEffect} from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FooterSmall from "components/Footers/FooterSmall.js";
import Axios from 'axios';
import {Rings} from "react-loader-spinner";
import { useHistory } from "react-router-dom";

export default function Register() {
  const { register, handleSubmit, reset } = useForm();
  const history = useHistory();

  useEffect(() => {
    // Check if the user is already logged in
    async function checkUserLogin() {
      try {
        const response = await Axios.get('http://127.0.0.1:8000/api/user', {
          withCredentials: true, // Include cookies with the request
        });
    
        if (response.status === 200) {
        history.push("/admin/maps"); // Redirect to the login page or any other authorized route
        }
      } catch (error) {
        console.log("No, you are not logged in", error);
        
      }
    }
    checkUserLogin();
  }, [history]);

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    agree: false,
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
  
      const response = await Axios.post('http://127.0.0.1:8000/api/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
  
      setLoading(false);
  
      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setErrorMessage(null);
        history.push("/verifyotp")
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
  
        // Reset the form fields and state
        resetState();
      } else {
        setErrorMessage(response.data.email);
        console.log(response);
        setSuccessMessage(null);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response.data.email[0]);
      setSuccessMessage(null);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };
  

  const resetState = () => {
    // Reset the form fields and state
    setInputs({ name: "", email: "", password: "", agree: false });
  };

  return (
    <>
    {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
          {/* Full-screen loader */}
          <Rings color="#00BFFF" height={80} width={80} />
        </div>
      )}
      {/* <Navbar transparent />  */}
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
              <div className="w-full lg:w-6/12 md:w-auto px-4">
                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                  <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                    <div className="text-blueGray-600 h-full text-center mb-4 mt-6 text-lg font-bold">
                      <span>CREATE AN ACCOUNT</span>
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
                          htmlFor="grid-password"
                        >
                          Name
                        </label>
                        <input
                          required
                          {...register("name")}
                          onChange={handleChange}
                          value={inputs.name}
                          name="name"
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Enter Name"
                        />
                      </div>

                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Email
                        </label>
                        <input
                          required
                          {...register("email")}
                          name="email"
                          onChange={handleChange}
                          value={inputs.email}
                          type="email"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Email"
                        />
                      </div>

                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Password
                        </label>
                        <input
                          required
                          {...register("password")}
                          onChange={handleChange}
                          value={inputs.password}
                          name="password"
                          type="password"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Password"
                        />
                      </div>

                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            required
                            {...register("agree")}
                            onChange={() =>
                              setInputs((prev) => ({
                                ...prev,
                                agree: !inputs.agree,
                              }))
                            }
                            id="customCheckLogin"
                            type="checkbox"
                            className="form-checkbox border-2 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                          />
                          <span className="ml-2 text-sm font-semibold text-blueGray-600">
                            I agree with the{" "}
                            <a
                              href="#pablo"
                              className="text-lightBlue-500"
                              onClick={(e) => e.preventDefault()}
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </label>
                      </div>

                      <div className="text-center mt-6">
                        <button
                          className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                          type="submit"
                        >
                          Get Started
                        </button>
                      </div>
                      <hr className="mt-6 border-b-1 border-blueGray-300" />
                    </form>

                    <div className="rounded-t mb-0 px-6 py-6">
                      <div className="text-center mb-3">
                        <span className="text-blueGray-500 text-sm p-4 font-bold">
                          OR SIGN UP WITH
                        </span>
                        <button
                          className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
                          type="button"
                        >
                          <img
                            alt="..."
                            className="w-5 mr-1 "
                            src={require("assets/img/google.svg").default}
                          />
                          Google
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <span classname="text-sm">Already have an Account ?</span>
                      <Link to="/login" className="text-blueGray-900 font-bold">
                        <span> Login here </span>
                      </Link>
                    </div>
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
