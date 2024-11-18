import { toast } from "react-toastify";

export const NotifySuccess = (message) =>
  toast.success(message, {
    position: "top-center",
    autoClose: 800,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    theme: "light",
  });

export const NotifyError = (message) =>
  toast.error(message, {
    position: "top-center",
    autoClose: 800,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    theme: "light",
  });

export const AlertMessage = (message) =>
  toast.info(message, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    theme: "light",
  });
