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

export const formatDateLocal = (dateTimeString) => {
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
    return `${day}-${month}-${year}`;
  }
};

export const getDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const shortDate = (dateTimeString) => {
  if (dateTimeString == "0000-00-00 00:00:00") {
    return "";
  } else {
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
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
    return `${day}/${month}/${year}`;
  }
};

export const formatTime = (dateTimeString) => {
  if (dateTimeString == "0000-00-00 00:00:00") {
    return "";
  } else {
    // Parse the date-time string
    const date = new Date(dateTimeString);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Format the date-time string
    return `${hours}:${minutes}`;
  }
};
