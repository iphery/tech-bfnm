import React from "react";
import Select, { components } from "react-select";

const GroupOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="text-strokedark">
        <div className="">{props.data.label}</div>
      </div>
    </components.Option>
  );
};

const GroupOptionWithSub = (props) => {
  return (
    <components.Option {...props}>
      <div className="text-strokedark">
        <div className="">{props.data.label}</div>
        <div className="text-sm">{props.data.title}</div>
      </div>
    </components.Option>
  );
};

export const CustomSelect = ({
  optionData,
  placeholder,
  onSelected,
  error,
  errorMessage,
  mode,
  onChg,
}) => {
  const customStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#3C50E0" : "red",
      borderRadius: "2px",
      backgroundColor: "white",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "white", // Makes the dropdown menu background transparent
    }),
    option: (baseStyles, { isFocused, isSelected }) => ({
      ...baseStyles,
      backgroundColor: isSelected
        ? "green"
        : isFocused
          ? "#80CAEE"
          : "transparent", // Adds a slight background on hover for visibility
    }),
  };

  return (
    <div>
      <Select
        styles={customStyles}
        onChange={(option) => {
          onSelected(option);
        }}
        isSearchable={true}
        //isClearable={true}
        options={optionData}
        placeholder={placeholder}
        components={{ Option: mode == 0 ? GroupOption : GroupOptionWithSub }}
      />
      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
    </div>
  );
};
