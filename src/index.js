import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { API_HOST } from "config";
import { AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from "config";

import { Provider } from "react-redux";
import store from "store";
import {
  //Themes,
  ThemeContext,
  FalcorProvider,
  falcorGraph,
  addComponents,
  addWrappers,
} from "@availabs/avl-components";

import reportWebVitals from "./reportWebVitals";

import {
  Components as AmsComponents,
  Wrappers as AmsWrappers,
  enableAuth,
} from "@availabs/ams";

import Theme from "Theme";
import "styles/tailwind.css";

console.log("theme", Theme);

addComponents(AmsComponents);
addWrappers(AmsWrappers);

const AuthEnabledApp = enableAuth(App, {
  AUTH_HOST,
  PROJECT_NAME,
  CLIENT_HOST,
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <FalcorProvider falcor={falcorGraph(API_HOST)}>
        <ThemeContext.Provider value={Theme}>
          <AuthEnabledApp />
        </ThemeContext.Provider>
      </FalcorProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
