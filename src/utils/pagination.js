// utils/paginateAndFilter.js

const paginateData = (
  filteredData,
  //keyword,
  currentPage,
  itemsPerPage,
) => {
  // Filter the data based on the keyword

  /*
  const filteredData = dataList.filter((item) =>
    item["description"].toLowerCase().includes(keyword.toLowerCase()),
  );
  */

  // Calculate the total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Ensure the current page is within bounds
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Calculate the start and end indices for slicing the filtered data
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the paginated data
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pageCurrent: validCurrentPage,
    pageLast: totalPages,
    start: startIndex,
    end: endIndex,
  };
};

export default paginateData;
