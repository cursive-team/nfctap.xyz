const fs = require("fs");

// Array of image paths
const imagePaths = [
  "../models/sigmoji.pass/icon.png",
  "../models/sigmoji.pass/logo.png",
  "../models/sigmoji.pass/strip.png",
];

const imageNames = ["icon", "logo", "strip"];

// Function to convert a file to a Base64 string
function fileToBase64(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err: any, buffer: any) => {
      if (err) reject(err);
      resolve(buffer.toString("base64"));
    });
  });
}

async function processFiles() {
  // Convert images to Base64
  const base64Images = [];
  for (let i in imagePaths) {
    const base64 = await fileToBase64(imagePaths[i]);
    const variableName = imageNames[i]; // Use variable name from imageNames array
    base64Images.push(`const ${variableName}Base64 = "${base64}";`);
  }

  // Convert JSON file to Base64
  const jsonBase64 = await fileToBase64("../models/sigmoji.pass/pass.json");
  const jsonVariable = `const jsonBase64 = "${jsonBase64}";`;

  // Combine all the Base64 strings and write to a new JS file
  const jsContent = [...base64Images, jsonVariable].join("\n\n") + "\n";
  fs.writeFile("data.ts", jsContent, (err: any) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
}

processFiles().catch(console.error);
