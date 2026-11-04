import { toast } from "react-toastify";

export const NotifySuccess = (message, title = "Berhasil") =>
  toast.success(
    <div>
      <div className="font-bold text-sm leading-snug">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{message}</div>
    </div>,
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    }
  );

export const NotifyError = (message, title = "Perhatian") =>
  toast.error(
    <div>
      <div className="font-bold text-sm leading-snug">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{message}</div>
    </div>,
    {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    }
  );

export const AlertMessage = (message, title = "Informasi") =>
  toast.info(
    <div>
      <div className="font-bold text-sm leading-snug">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{message}</div>
    </div>,
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    }
  );
