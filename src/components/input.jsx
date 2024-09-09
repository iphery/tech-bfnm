import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { NumericFormat } from "react-number-format";

export const CommonInput = ({
  input,
  type,
  placeholder,
  error,
  errorMessage,
  onInputChange,
  onKeyChange,
  children,
  reference,
  isDisabled,
  onChg,
  isAutoFocus,
}) => {
  return (
    <div className="relative">
      <input
        value={input}
        type={type}
        ref={reference}
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={isAutoFocus}
        onInput={(event) => {
          const value = event.target.value;

          //const filtered = value.replace(/\D/g, "");

          onInputChange(value);
        }}
        onKeyDown={onKeyChange}
        onChange={onChg}
        className={`w-full rounded-sm border-[1.5px] bg-white  px-2 py-1 outline-none transition ${
          error ? "border-red" : "border-stroke"
        } bg-transparent text-black focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
      />
      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
      <span className="absolute right-4 top-2">
        <div opacity="0.5">{children}</div>
      </span>
    </div>
  );
};

export const CommonInputFile = ({
  input,
  type,
  placeholder,
  error,
  errorMessage,
  onInputChange,
  onKeyChange,
  children,
  reference,
  isDisabled,

  isAutoFocus,
}) => {
  return (
    <div className="relative">
      <input
        value={input}
        type={"file"}
        ref={reference}
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={isAutoFocus}
        onKeyDown={onKeyChange}
        onChange={(event) => {
          const value = event.target.files[0];

          //const filtered = value.replace(/\D/g, "");

          onInputChange(value);
        }}
        className={`w-full rounded-sm border-[1.5px] bg-white  px-2 py-1 outline-none transition ${
          error ? "border-red" : "border-stroke"
        } bg-transparent text-black focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
      />
      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
      <span className="absolute right-4 top-2">
        <div opacity="0.5">{children}</div>
      </span>
    </div>
  );
};

export const CommonInputIcon = ({
  input,
  type,
  placeholder,
  error,
  errorMessage,
  onInputChange,
  onKeyChange,
  children,
}) => {
  return (
    <div className="relative">
      <input
        value={input}
        type={type}
        placeholder={placeholder}
        onInput={(event) => {
          const value = event.target.value;

          //const filtered = value.replace(/\D/g, "");

          onInputChange(value);
        }}
        onKeyDown={onKeyChange}
        className={`w-full rounded-sm border-[1.5px] bg-white  px-2 py-1 outline-none transition ${
          error ? "border-red" : "border-stroke"
        } bg-transparent text-black focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
      />
      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
      <span className="absolute right-4 top-1">
        <div opacity="0.5">{children}</div>
      </span>
    </div>
  );
};

export const CommonTextArea = ({
  input,
  type,
  placeholder,
  error,
  errorMessage,
  onInputChange,
  onKeyChange,
  children,
  reference,
  isDisabled,
  onChg,
}) => {
  return (
    <div className="relative">
      <textarea
        value={input}
        type={type}
        ref={reference}
        placeholder={placeholder}
        disabled={isDisabled}
        onInput={(event) => {
          const value = event.target.value;

          //const filtered = value.replace(/\D/g, "");

          onInputChange(value);
        }}
        onKeyDown={onKeyChange}
        onChange={onChg}
        className={`min-h-20 w-full rounded-sm border-[1.5px] bg-white  px-2 py-1 outline-none transition ${
          error ? "border-red" : "border-stroke"
        } bg-transparent text-black focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
      ></textarea>
      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
      <span className="absolute right-4 top-2">
        <div opacity="0.5">{children}</div>
      </span>
    </div>
  );
};

export const CurrencyInput = ({
  input,
  placeholder,
  error,
  onInputChange,
  errorMessage,
  onKeyChange,
  children,
}) => {
  const leadingTextClass = false ? "mr-2 text-red" : "mr-2";

  return (
    <div className="relative">
      {input != "" ? (
        <span className="absolute left-2 top-1 ">
          <div opacity="0.5">{children}</div>
        </span>
      ) : (
        <></>
      )}
      <div className="flex flex-row items-center">
        <NumericFormat
          value={input}
          placeholder={placeholder}
          onInput={(event) => {
            const value = event.target.value;

            const separator = value.replace(/\./g, "");

            const decimal = parseFloat(separator.replace(",", "."));
            const result = value == "" ? 0 : decimal;

            onInputChange(result);
          }}
          onChange={onKeyChange}
          thousandSeparator="."
          decimalSeparator=","
          className={`w-full rounded-sm border-[1.5px] bg-white py-1  pl-10 pr-2 outline-none transition ${
            error ? "border-red" : "border-stroke"
          } bg-transparent text-black focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
        />
      </div>

      {error ? (
        <span className="mt-1 text-sm text-red">{errorMessage}</span>
      ) : (
        <></>
      )}
    </div>
  );
};
