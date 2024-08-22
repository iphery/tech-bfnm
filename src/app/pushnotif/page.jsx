"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import io from "socket.io-client";

export default function Home() {
  const [data, setData] = useState([]);
  const [socket, setSocket] = useState(null);

  const url = "https://king.pineapple.farmaguru.id";

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Set up Socket.IO connection
    const newSocket = io(url);
    //setSocket(newSocket);

    newSocket.on("dataUpdate", (updatedData) => {
      setData((prevData) => [...prevData, updatedData]);
    });

    return () => newSocket.close();
  }, []);

  const fetchData = async () => {
    const response = await axios.get(
      "https://king.pineapple.farmaguru.id/api/data",
      {},
    );

    if (response.status == 200) {
      console.log(response);
      setData(response.data);
    }

    //const jsonData = await response.json();
    //
  };

  const addData = async () => {
    const newData = {
      /* your data structure */
    };
    await fetch(`${url}/api/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
  };

  return (
    <div>
      <h1>Real-time Data</h1>
      <button onClick={addData}>Add Data</button>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}
