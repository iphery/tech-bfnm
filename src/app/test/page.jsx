"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEffect, useState } from "react";

export default function Page() {
  const [inputs, setInputs] = useState([]);

  useEffect(() => {}, [inputs]);

  return (
    <DefaultLayout>
      <div
        onClick={() => {
          const new_data = [...inputs];
          new_data.push({
            title: "a",

            array: [
              {
                title1: "b",
                array: [{ title2: "c" }],
              },
            ],
          });
          setInputs(new_data);

          //setInputs((prevs) => [...prevs, "a"]);
        }}
      >
        Add
      </div>
      <div
        onClick={() => {
          console.log(inputs);
        }}
      >
        Print
      </div>
      <div className="grid grid-cols-5 gap-2">
        {inputs.map((item, index) => {
          return (
            <div className="w-[200px] border p-2" key={index}>
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  {`INPUT ${index}`}
                </label>
                <input
                  onChange={(event) => {
                    const new_data = [...inputs];
                    new_data[index].title = event.target.value;
                    setInputs(new_data);
                  }}
                  type="text"
                  placeholder="Default Input 1"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {item.array.map((item1, index1) => {
                return (
                  <div className="ml-5" key={index1}>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        {`SUB INPUT`}
                      </label>
                      <input
                        onChange={(event) => {
                          const new_data = [...inputs];
                          new_data[index].array[index1].title1 =
                            event.target.value;
                          setInputs(new_data);
                        }}
                        type="text"
                        placeholder="Default Input 1"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {item1.array.map((item1, index2) => {
                      return (
                        <div className="ml-5" key={index2}>
                          <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              {`SUB INPUT`}
                            </label>
                            <input
                              onChange={(event) => {
                                const new_data = [...inputs];
                                new_data[index].array[index1].array[
                                  index2
                                ].title2 = event.target.value;
                                setInputs(new_data);
                              }}
                              type="text"
                              placeholder="Default Input 1"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </DefaultLayout>
  );
}
