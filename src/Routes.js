// --- Public Pages ------

import Home from "pages/Home";

import Auth from "pages/Auth";
import NoMatch from "pages/404";

export default [
  // -- Public -- //

  // -- Authed -- //

  ...Home,

  Auth,

  // -- Misc
  NoMatch,
];
