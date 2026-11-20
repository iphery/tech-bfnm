export const RepairStatus = (step) => {
  const stepStr = String(step || "").trim();
  let status = "Issued";
  let cardColor = "bg-danger";

  switch (stepStr) {
    case "2":
      status = "Responsed";
      cardColor = "bg-warning";
      break;
    case "3":
      status = "Waiting part";
      cardColor = "bg-warning";
      break;
    case "4":
      status = "Continue repairing";
      cardColor = "bg-warning";
      break;
    case "5":
      status = "Completed";
      cardColor = "bg-meta-10";
      break;
    case "6":
      status = "Checked";
      cardColor = "bg-meta-10";
      break;
    case "7":
      status = "Accepted";
      cardColor = "bg-success";
      break;
    case "1":
    default:
      status = "Issued";
      cardColor = "bg-danger";
      break;
  }

  return { status, color: cardColor };
};
