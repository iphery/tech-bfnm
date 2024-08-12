import { AiOutlineQuestionCircle } from "react-icons/ai";

export const ProgressCard = ({ title, name, dateString, isActive }) => {
  return (
    <div className="flex flex-row justify-between p-1">
      <div className="text-white">{title}</div>
      {!isActive ? (
        <>
          <AiOutlineQuestionCircle />
        </>
      ) : (
        <div className="flex flex-col ">
          <div className="text-right text-white">{name}</div>
          <div className="text-right text-xs text-white">{dateString}</div>
        </div>
      )}
    </div>
  );
};

export const ProgressSummary = ({ title, hour, isActive }) => {
  return (
    <div className="flex flex-row justify-between p-1">
      <div className=" text-white">{title}</div>

      {isActive ? (
        <div className="text-right text-white">{`${hour} Jam`}</div>
      ) : (
        <AiOutlineQuestionCircle />
      )}
    </div>
  );
};

export const PageCard = ({ children }) => {
  return (
    <div className=" w-full rounded-sm border border-strokedark bg-boxdark shadow-default">
      <div className="p-3">{children}</div>
    </div>
  );
};

export const PageCardLimited = ({ children }) => {
  return (
    <div className=" w-full flex-1 rounded-sm border border-strokedark bg-boxdark shadow-default">
      <div className="p-3">{children}</div>
    </div>
  );
};
