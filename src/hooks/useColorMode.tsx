import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

type SetValue<T> = T | ((val: T) => T);

const useColorMode = (): [string, (value: SetValue<string>) => void] => {
  const [colorMode, setColorMode] = useLocalStorage("color-theme", "light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const className = "dark";
    const bodyClass = window.document.body.classList;
    const htmlClass = window.document.documentElement.classList;

    if (colorMode === "dark") {
      bodyClass.add(className);
      htmlClass.add(className);
    } else {
      bodyClass.remove(className);
      htmlClass.remove(className);
    }
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
