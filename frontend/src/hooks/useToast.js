import { useDispatch } from "react-redux";
import { addToast } from "../redux/slices/uiSlice";

export default function useToast() {
  const dispatch = useDispatch();
  return {
    success: (message) => dispatch(addToast({ message, type: "success" })),
    error: (message) => dispatch(addToast({ message, type: "error" })),
    info: (message) => dispatch(addToast({ message, type: "info" })),
  };
}
