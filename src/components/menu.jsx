import { ICON } from "@/utils/constant";

export const Menu = ({ url, children }) => {
  return (
    <div className="col ">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded border border-white bg-white p-2 ">
          <img className="h-10 " src={`${ICON}/${url}`} />
        </div>
      </div>

      <div className="text-center text-sm">{children}</div>
    </div>
  );
};
