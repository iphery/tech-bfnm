export const RepairStatus = (step) => {
  const stepStr = String(step ?? "").trim();
  let status = "Issued";
  let cardColor = "bg-danger";
  let hexColor = "#D34053";

  switch (stepStr) {
    case "2":
      status = "Responsed";
      cardColor = "bg-warning";
      hexColor = "#FFA70B";
      break;
    case "3":
      status = "Waiting part";
      cardColor = "bg-warning";
      hexColor = "#F0950C";
      break;
    case "4":
      status = "Continue repairing";
      cardColor = "bg-warning";
      hexColor = "#259AE6";
      break;
    case "5":
      status = "Completed";
      cardColor = "bg-meta-10";
      hexColor = "#0FADCF";
      break;
    case "6":
      status = "Checked";
      cardColor = "bg-meta-10";
      hexColor = "#0FADCF";
      break;
    case "7":
      status = "Accepted";
      cardColor = "bg-success";
      hexColor = "#219653";
      break;
    case "1":
    default:
      status = "Issued";
      cardColor = "bg-danger";
      hexColor = "#D34053";
      break;
  }

  return { status, color: cardColor, hexColor };
};
