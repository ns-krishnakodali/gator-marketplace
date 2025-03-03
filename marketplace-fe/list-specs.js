const glob = require("glob");

console.log("Running Spec Files:");
const specFiles = glob.sync("src/**/*.spec.ts");
specFiles.forEach((file) => console.log(file));

if (specFiles.length === 0) {
  console.warn("⚠️ No spec files found!");
}
