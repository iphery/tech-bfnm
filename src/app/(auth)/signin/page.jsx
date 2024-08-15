"use client";
import React, { useContext, useState } from "react";
import { CommonInput, CommonInputIcon } from "@/components/input";
import { HiLockClosed, HiOutlineMail } from "react-icons/hi";
import { CommonButtonFull } from "@/components/button";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase-config";

const SignIn = () => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputEmailError, setEmailError] = useState(false);
  const [inputEmailMessage, setEmailMessage] = useState("");

  const [inputPassword, setInputPassword] = useState("");
  const [inputPasswordError, setPasswordError] = useState(false);
  const [inputPasswordMessage, setPasswordMessage] = useState("");

  const [onloadLogin, setOnloadLogin] = useState(false);
  const [disabledLogin, setDisabledLogin] = useState(false);

  const fetch_data = async (uid) => {
    console.log("sini");
    console.log(uid);
    const apiUrl = `${API_URL}/fetchuser`;
    const response = await axios.post(apiUrl, {
      uid: uid,
    });

    if (response.status == 200) {
      console.log(response.data["data"]);
      localStorage.setItem("info", JSON.stringify(response.data["data"]));
      window.location.reload();
    }
    setOnloadLogin(false);
  };
  const proceed_login = async () => {
    setOnloadLogin(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        inputEmail,
        inputPassword,
      );

      fetch_data(userCredential.user.uid);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-boxdark-2 p-10">
        <div className="flex w-full rounded-sm border border-strokedark bg-boxdark shadow-default sm:w-1/3">
          <div className="w-full p-4 sm:p-12.5 ">
            <h2 className="mb-9 text-2xl font-bold text-black  text-white sm:text-title-xl2">
              Login
            </h2>

            <CommonInputIcon
              placeholder={"Enter your email"}
              type={"text"}
              error={inputEmailError}
              errorMessage={inputEmailMessage}
              onInputChange={(val) => {
                setInputEmail(val);
              }}
              onKeyChange={() => {
                setEmailError(false);
              }}
            >
              <HiOutlineMail className="h-7 w-7"></HiOutlineMail>
            </CommonInputIcon>
            <div className="mb-5" />
            <CommonInputIcon
              placeholder={"Enter your password"}
              type={"password"}
              error={inputPasswordError}
              errorMessage={inputPasswordMessage}
              onInputChange={(val) => {
                setInputPassword(val);
              }}
              onKeyChange={() => {
                setPasswordError(false);
              }}
            >
              <HiLockClosed className="h-7 w-7" />
            </CommonInputIcon>
            <div className="mb-10" />
            <div className="w-full">
              <CommonButtonFull
                label={"Login"}
                onClick={proceed_login}
                onload={onloadLogin}
                disabled={disabledLogin}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
