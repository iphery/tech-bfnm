"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useMediaQuery } from "react-responsive";
import { CommonInput } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { useEffect, useState } from "react";
import Select, { components } from "react-select";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { redirect } from "next/dist/server/api-utils";
import { CustomSelect } from "@/components/select";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import UserAuth from "@/components/auth";
import { useRouter } from "next/navigation";

//import { AppBar } from "@/components/appbar";

const GroupOption = (props) => {
  return (
    <components.Option {...props}>
      <div>
        <div className="">{props.data.label}</div>
      </div>
    </components.Option>
  );
};

export default function Page() {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const router = useRouter();
  //description
  //manufacture
  //model
  //no
  //user
  //year
  //class
  //based
  //location
  //type

  const groupData = [
    { label: "Air Conditioner", value: "AC" },
    { label: "Apar", value: "AP" },
    { label: "Box Hidrant", value: "BH" },
    { label: "Forklift", value: "FK" },
    { label: "Genset", value: "GS" },
    { label: "Hidrant", value: "HY" },
    { label: "Kendaraan", value: "K" },
    { label: "Mesin Produksi", value: "MP" },
    { label: "Komputer", value: "PC" },
    { label: "Panel Listrik", value: "PN" },
  ];

  const maintenanceBased = [
    { label: "Time Based", value: "Time" },
    { label: "KM Based", value: "KM" },
  ];

  const locationData = [
    { label: "Time Based", value: "Time" },
    { label: "KM Based", value: "KM" },
  ];

  const [categoryOption, setCategoryOption] = useState([]);
  const [userOption, setUserOption] = useState([]);

  const placeholder = [
    "Deskripsi",
    "Manufacture",
    "Model",
    "No",
    "Tahun",
    "Lokasi",
  ];
  const inputNum = 6;
  const [inputs, setInput] = useState(Array(inputNum).fill(""));
  const [inputError, setError] = useState(Array(inputNum).fill(false));
  const [inputErrorMessage, setErrorMessage] = useState(
    Array(inputNum).fill(""),
  );

  const [selectedGroup, setGroup] = useState("");
  const [groupError, setGroupError] = useState(false);
  const [groupErrorMessage, setGroupErrorMessage] = useState(false);

  const [selectedCategory, setCategory] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState(false);

  const [selectedUser, setUser] = useState("");
  const [userError, setUserError] = useState(false);
  const [userErrorMessage, setUserErrorMessage] = useState(false);

  const [selectedBased, setBased] = useState("");
  const [basedError, setBasedError] = useState(false);
  const [basedErrorMessage, setBasedErrorMessage] = useState("");

  const [onloadButton, setOnload] = useState(false);
  const [disabledButton, setDisabled] = useState(false);

  const updateInput = (index, value) => {
    const newInputs = [...inputs];

    newInputs[index] = value;
    console.log(newInputs);
    setInput(newInputs);
  };
  const updateInputError = (index, value) => {
    const newInputs = [...inputError];
    newInputs[index] = value;
    // console.log(newInputs);
    setError(newInputs);
  };

  const submit_new_data = async () => {
    setOnload(true);
    setDisabled(true);
    let array = [];
    let array_message = [];
    let error = 0;
    for (let input of inputs) {
      if (input == "" || input == null) {
        array.push(true);
        array_message.push("Required");
        error = 1;
      } else {
        array.push(false);
        array_message.push("");
      }
    }
    setError(array);
    setErrorMessage(array_message);

    if (selectedGroup == null || selectedGroup == "") {
      setGroupError(true);
      setGroupErrorMessage("Required");
    } else {
      setGroupError(false);
      setGroupErrorMessage("");
    }

    if (selectedCategory == null || selectedCategory == "") {
      setCategoryError(true);
      setCategoryErrorMessage("Required");
    } else {
      setCategoryError(false);
      setCategoryErrorMessage("");
    }

    if (selectedUser == null || selectedUser == "") {
      setUserError(true);
      setUserErrorMessage("Required");
    } else {
      setUserError(false);
      setUserErrorMessage("");
    }

    if (selectedBased == null || selectedBased == "") {
      setBasedError(true);
      setBasedErrorMessage("Required");
    } else {
      setBasedError(false);
      setBasedErrorMessage("");
    }

    if (error == 0 || !groupError || !categoryError) {
      const apiUrl = `${API_URL}/createnewasset`;
      const response = await axios.post(apiUrl, {
        group: selectedGroup,
        category: selectedCategory,
        user: selectedUser,
        based: selectedBased,
        data: inputs,
      });

      if (response.status == 200) {
        console.log("ok");
        router.push("/");
      }
    }

    setOnload(false);
    setDisabled(false);
  };

  const data_for_new_asset = async () => {
    const apiUrl = `${API_URL}/datafornewasset`;
    const response = await axios.get(apiUrl);

    if (response.status == 200) {
      console.log(response.data);

      setCategoryOption(
        response.data["category"].map((item) => ({
          value: item.label,
          label: item.label,
        })),
      );
      setUserOption(
        response.data["employee"].map((item) => ({
          value: item.name,
          label: item.name,
          title: item.division,
        })),
      );
    }
  };

  useEffect(() => {
    data_for_new_asset();
  }, []);

  return (
    <UserAuth>
      {isSmallScreen ? (
        <>
          <div className="min-h-screen  justify-center bg-boxdark-2">
            <header className="bg-boxdark-2 text-white shadow-md">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center justify-start text-xl font-semibold ">
                  <Link href="/">
                    <HiArrowLeft />
                  </Link>
                  <div className="ml-2">New Asset</div>
                </div>
                {/*
                    <nav className="space-x-4">
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </nav>
                */}
              </div>
            </header>

            <div className="p-2">
              <CustomSelect
                optionData={groupData}
                placeholder={"Pilih group asset"}
                error={groupError}
                errorMessage={groupErrorMessage}
                mode={0}
                onSelected={(option) => {
                  console.log(option);
                  setGroup(option.value);
                }}
              />
            </div>

            <div className="p-2">
              <CustomSelect
                optionData={categoryOption}
                placeholder={"Pilih group lokasi"}
                error={categoryError}
                errorMessage={categoryErrorMessage}
                mode={0}
                onSelected={(option) => {
                  setCategory(option.value);
                }}
              />
            </div>

            {inputs.map((input, index) => (
              <div className="p-2" key={index}>
                <CommonInput
                  input={inputs[index]}
                  placeholder={placeholder[index]}
                  error={inputError[index]}
                  errorMessage={inputErrorMessage[index]}
                  onInputChange={(val) => {
                    updateInput(index, val);
                  }}
                  onKeyChange={() => {
                    updateInputError(index, false);
                  }}
                ></CommonInput>
              </div>
            ))}

            <div className="p-2">
              <CustomSelect
                optionData={locationData}
                placeholder={"Pilih tipe maintenance"}
                error={basedError}
                errorMessage={basedErrorMessage}
                mode={0}
                onSelected={(option) => {
                  setBased(option.value);
                }}
              />
            </div>
            <div className="p-2">
              <CustomSelect
                optionData={userOption}
                placeholder={"Pilih user"}
                error={userError}
                errorMessage={userErrorMessage}
                mode={1}
                onSelected={(option) => {
                  setUser(option.value);
                }}
              />
            </div>
            <div className="px-2 py-5">
              <CommonButtonFull
                label={"Submit"}
                onload={onloadButton}
                disabled={disabledButton}
                onClick={submit_new_data}
              />
            </div>
          </div>
        </>
      ) : (
        <DefaultLayout>
          <div>bbb</div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
