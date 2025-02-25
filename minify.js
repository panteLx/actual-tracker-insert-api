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

minifyCSS("src/assets/css/style.css", "public/css/style.min.css");
minifyJS("src/assets/js/adminPanel.js", "public/js/adminPanel.min.js");
minifyJS("src/assets/js/adminLogs.js", "public/js/adminLogs.min.js");
minifyJS("src/assets/js/userPanel.js", "public/js/userPanel.min.js");
minifyJS("src/assets/js/authLogin.js", "public/js/authLogin.min.js");
minifyJS(
  "src/assets/js/transactionTracker.js",
  "public/js/transactionTracker.min.js"
);
