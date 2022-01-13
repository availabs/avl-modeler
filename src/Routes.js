// --- Public Pages ------

import Home from "pages/Home";
import PopSynthGenerateInput from "pages/Home/create";

import Auth from "pages/Auth";
import NoMatch from "pages/404";

export default [
  // -- Public -- //

  // -- Authed -- //

  ...Home,
  ...PopSynthGenerateInput,

  Auth,

  // -- Misc
  NoMatch,
];
