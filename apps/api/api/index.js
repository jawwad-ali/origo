// Vercel Function entry. `nest build` (the project's build command) compiles src/ to dist/; every request
// is rewritten here (vercel.json) and handled by the Nest app in dist/serverless.js.
module.exports = require("../dist/serverless.js").default;
