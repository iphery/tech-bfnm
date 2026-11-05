"use client";
import { useEffect, useState } from "react";

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        if (!item) return initialValue;
        try {
          return JSON.parse(item);
        } catch {
          // Handle case where value was stored as bare unquoted string
          return item as unknown as T;
        }
      }
    } catch (error) {
      console.error("useLocalStorage read error:", error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      const valueToStore =
        typeof storedValue === "function"
          ? (storedValue as (val: T) => T)(storedValue)
          : storedValue;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("useLocalStorage write error:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
