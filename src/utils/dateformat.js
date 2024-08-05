export const formatDateTime = (dateTimeString) => {
  if (dateTimeString == "0000-00-00 00:00:00") {
    return "";
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Parse the date-time string
    const date = new Date(dateTimeString);

    // Extract the individual components
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Format the date-time string
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  }
};

export const formatDate = (dateTimeString) => {
  if (dateTimeString == "0000-00-00 00:00:00") {
    return "";
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Parse the date-time string
    const date = new Date(dateTimeString);

    // Extract the individual components
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Format the date-time string
    return `${month} ${day}, ${year}`;
  }
};
