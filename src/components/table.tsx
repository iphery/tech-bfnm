import { Children } from "react";

export const TableHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <th className="text-gray-600 bg-blue-100 px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
  decodeURIComponent;
};

export const TableContent = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  const backgroundColor =
    index % 2 === 0
      ? "bg-white px-6 py-3 border-b border-gray text-left text-sm  tracking-wider align-top text-right"
      : "bg-gray px-6 py-3 border-b border-gray text-left text-sm tracking-wider align-top";

  return <td className={backgroundColor}>{children}</td>;
};

export const TableContentSpan = ({
  children,
  index,
  span,
}: {
  children: React.ReactNode;
  index: number;
  span: number;
}) => {
  const backgroundColor =
    index % 2 === 0
      ? "bg-white px-6 py-3 border-b border-gray text-left text-sm  tracking-wider align-top"
      : "bg-gray px-6 py-3 border-b border-gray text-left text-sm tracking-wider align-top";

  return (
    <td colSpan={span} className={backgroundColor}>
      {children}
    </td>
  );
};
