import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StreakProvider } from "./components/StreakContext";
import "./style/index.css";
import StreakPopup from "./components/StreakPopUp";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StreakProvider>
        <StreakPopup/>
          <App />
      </StreakProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
