export const RepairStatus = (step) => {
  const stepStr = String(step ?? "").trim();
  let status = "Menunggu Penanganan";
  let statusEn = "Issued";
  let cardColor = "bg-danger";
  let hexColor = "#D34053";

  switch (stepStr) {
    case "2":
      status = "Sedang Dikerjakan";
      statusEn = "Responsed";
      cardColor = "bg-warning";
      hexColor = "#FFA70B";
      break;
    case "3":
      status = "Menunggu Spare Part";
      statusEn = "Waiting part";
      cardColor = "bg-warning";
      hexColor = "#F0950C";
      break;
    case "4":
      status = "Lanjut Perbaikan";
      statusEn = "Continue repairing";
      cardColor = "bg-warning";
      hexColor = "#259AE6";
      break;
    case "5":
      status = "Selesai Pengerjaan";
      statusEn = "Completed";
      cardColor = "bg-meta-10";
      hexColor = "#0FADCF";
      break;
    case "6":
      status = "Sudah Diperiksa";
      statusEn = "Checked";
      cardColor = "bg-meta-10";
      hexColor = "#0FADCF";
      break;
    case "7":
      status = "Unit Diterima";
      statusEn = "Accepted";
      cardColor = "bg-success";
      hexColor = "#219653";
      break;
    case "1":
    default:
      status = "Menunggu Penanganan";
      statusEn = "Issued";
      cardColor = "bg-danger";
      hexColor = "#D34053";
      break;
  }

  return { status, statusEn, color: cardColor, hexColor };
};
