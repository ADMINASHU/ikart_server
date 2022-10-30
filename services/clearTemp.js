import fs from "fs";
const clearTempImage = (image) =>
  fs.unlink(image.tempFilePath, (err) => (err ? console.log(err) : null));

export default clearTempImage;
