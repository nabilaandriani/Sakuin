import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StreakProvider } from "./components/StreakContext";
import "./style/index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StreakProvider>
        <App />
      </StreakProvider>
    </BrowserRouter>
  </React.StrictMode>
);