const pdfParseReq = require("pdf-parse");
// import * as pdfParseImport from "pdf-parse";
// import pdfParseDefault from "pdf-parse";

console.log("--- DEBUG START ---");
console.log("Type of require('pdf-parse'):", typeof pdfParseReq);
console.log("Is function?", typeof pdfParseReq === "function");
console.log("Keys:", Object.keys(pdfParseReq));
if (typeof pdfParseReq === "object") {
  console.log("Has default?", "default" in pdfParseReq);
  if ("default" in pdfParseReq) {
    console.log("Type of default:", typeof pdfParseReq.default);
  }
}
console.log("--- DEBUG END ---");
