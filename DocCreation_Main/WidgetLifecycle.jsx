import React, { useEffect, useState } from "react";
import { refreshWidgetData } from "../../services/api/refreshService";
import useToast from "../../hooks/useToast";
import { MSG_REFRESH_ERROR, MSG_REFRESH_SUCCESS } from "../../utils/toastMessages";
import store from "../../store";
import Loader from "../../components/Loader/Loader";
import useBOSDropableArea from "../../hooks/useBOSDropableArea";

const WidgetLifecycle = () => {
  const { handleDrop } = useBOSDropableArea();
  const { showSuccessToast, showErrorToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Function to check if refresh was auto-triggered
  const isAutoTriggeredRefresh = (trace) => {
    return trace.some(
      (line) =>
        line.includes("UWA_Frame_Alone.js") || line.includes("bundle-min.js")
    );
  };

  useEffect(() => {
    if (!window.widget) return;

    const onRefresh = async () => {
      const trace = new Error().stack.split("\n");

      const userClickedRefresh = sessionStorage.getItem("userClickedRefresh");

      if (isAutoTriggeredRefresh(trace) && !userClickedRefresh) {
        console.warn("Auto-refresh detected. Ignoring unwanted `onRefresh`.");
        return; // Block auto-triggered refresh
      }

      sessionStorage.removeItem("userClickedRefresh");

      setLoading(true);

      const latestState = store.getState();
      const latestDraggedData = latestState.droppedObject.droppedObjectData.initialDraggedData;

      if (!latestDraggedData?.data?.items?.length) {
        console.error("`initialDraggedData` is missing or invalid:", latestDraggedData);
        setLoading(false);
        return;
      }

      try {
        await refreshWidgetData(latestDraggedData.data.items, handleDrop);
      } catch (error) {
        console.error("Error during refresh:", error);
        showErrorToast(MSG_REFRESH_ERROR); // Show error toast to user
      } finally {
        setLoading(false);
        showSuccessToast(MSG_REFRESH_SUCCESS); // Show success toast
      }
    };

    window.widget.addEvent("onRefresh", onRefresh);

    // Cleanup: Remove event listener on component unmount
    return () => {
      window.widget.removeEvent("onRefresh", onRefresh);
    };
  }, []); // Empty dependency array ensures this effect runs once when the component mounts

  return loading ? <Loader /> : null;
};

export default WidgetLifecycle;
