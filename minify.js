import fs from "fs";
import CleanCSS from "clean-css";
import UglifyJS from "uglify-js";

const minifyCSS = (inputFile, outputFile) => {
  const input = fs.readFileSync(inputFile, "utf8");
  const output = new CleanCSS().minify(input).styles;
  fs.writeFileSync(outputFile, output);
};

const minifyJS = (inputFile, outputFile) => {
  const input = fs.readFileSync(inputFile, "utf8");
  const output = UglifyJS.minify(input).code;
  fs.writeFileSync(outputFile, output);
};

minifyCSS("public/css/style.css", "public/css/style.min.css");
minifyJS("public/js/adminPanel.js", "public/js/adminPanel.min.js");
minifyJS("public/js/adminLogs.js", "public/js/adminLogs.min.js");
minifyJS("public/js/userPanel.js", "public/js/userPanel.min.js");
minifyJS(
  "public/js/transactionTracker.js",
  "public/js/transactionTracker.min.js"
);
