import { ButtonLoader } from "@/components/loader";

export const CommonButton = ({ label, onload, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-sm border border-bodydark bg-buttonnormal p-2 text-sm text-white shadow-md hover:bg-buttonhover"
      disabled={disabled}
    >
      {onload ? <ButtonLoader color={"white"} /> : label}
    </button>
  );
};

export const CommonButtonColor = ({
  color1,
  color2,
  label,
  onload,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border border-bodydark ${color1}  p-2 text-sm text-white shadow-md hover:${color2}`}
      disabled={disabled}
    >
      {onload ? <ButtonLoader color={"white"} /> : label}
    </button>
  );
};

export const CommonButtonFull = ({ label, onload, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-default rounded-sm border border-bodydark bg-buttonnormal p-3 text-sm text-white shadow-md hover:bg-buttonhover"
      disabled={disabled}
    >
      {onload ? <ButtonLoader color={"white"} /> : label}
    </button>
  );
};
