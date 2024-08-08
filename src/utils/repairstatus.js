export const RepairStatus = (step) => {
  let status = "Issued";
  let cardColor = "bg-red";
  switch (step) {
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

    default:
      "";
  }

  return { status: status, color: cardColor };
};
