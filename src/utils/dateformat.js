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

export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function to get current time in HH:MM format
export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = "00";
  return `${hours}:${minutes}:${seconds}`;
};

export const getCurrentDateFromDatetime = (datetime) => {
  const today = new Date(datetime);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeFromDatetime = (datetime) => {
  const now = new Date(datetime);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
