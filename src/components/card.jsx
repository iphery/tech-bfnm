export const ProgressCard = ({ title, name, dateString }) => {
  return (
    <div className="flex flex-row justify-between">
      <div>{title}</div>
      <div className="flex flex-col ">
        <div className="text-right">{name}</div>
        <div className="text-right text-xs">{dateString}</div>
      </div>
    </div>
  );
};

export const ProgressSummary = ({ title, hour }) => {
  return (
    <div className="flex flex-row justify-between">
      <div>{title}</div>

      <div className="text-right">{`${hour} Jam`}</div>
    </div>
  );
};
