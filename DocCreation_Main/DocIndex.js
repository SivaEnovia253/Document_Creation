import React from "react";
import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import "../../index.css";
import { Provider } from "react-redux";
import store from "../../store";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import "../../styles/variables.css";
import WidgetLifecycle from "./WidgetLifecycle";
import BOSWidget from "./BOSWidget";
import "bootstrap/dist/js/bootstrap.bundle.min";

// This function mounts the React app.
let root = null; // Global React root
const start = () => {
  const loadPlatformAPI = async () => {
    try {
      if (window.requirejs) {
        const PlatformAPI = await requirejs(["DS/PlatformAPI/PlatformAPI"]);
        window.PlatformAPI = PlatformAPI;
      } else {
        console.error("requirejs is not available.");
      }
    } catch (error) {
      console.error("Error loading PlatformAPI:", error);
    }
  };

  loadPlatformAPI();

  let rootElement =
    window.widget?.body?.querySelector("#root") ||
    document.getElementById("root");

  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    if (window.widget && window.widget.body) {
      window.widget.body.appendChild(rootElement);
    } else {
      document.body.appendChild(rootElement);
    }
  }

  if (!root) {
    root = ReactDOM.createRoot(rootElement);
  }

  root.render(
    <Provider store={store}>
      <WidgetLifecycle />
      <BOSWidget />
      <ToastContainer />
    </Provider>
  );
};

// Function to inject the refresh listener script into the **parent window**
const injectRefreshListener = () => {
  const scriptContent = `
    function listenForRefreshClicks() {
      document.body.addEventListener("click", function (event) {
        let refreshButton = event.target.closest("#refresh");

        if (refreshButton) {
          sessionStorage.setItem("userClickedRefresh", "true");
        }
      }, true);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", listenForRefreshClicks);
    } else {
      listenForRefreshClicks();
    }
  `;

  if (window.parent && window.parent.document) {
    let injectedScript = window.parent.document.createElement("script");
    injectedScript.textContent = scriptContent;
    window.parent.document.body.appendChild(injectedScript);
  } else {
    console.warn("Unable to inject script—parent window not accessible.");
  }
};

// ✅ Inject the script when the React app starts
injectRefreshListener();

export default function () {
  if (window.widget) {
    let hasOnLoadRun = false;

    window.widget.addEvent("onLoad", () => {
      if (hasOnLoadRun) {
        console.warn("onLoad was already executed. Ignoring duplicate trigger.");
        return;
      }
      hasOnLoadRun = true;

      start(); // This will initialize the React app
    });
  } else {
    console.error("Widget not detected! onLoad cannot be registered.");
  }
}
