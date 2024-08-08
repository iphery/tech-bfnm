import { HiOutlineMail } from "react-icons/hi";

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
}) => {
  return (
    <div className="relative">
      <input
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
