import { GSCloudEvent, GSContext } from "@godspeedsystems/core";
import fs from "fs";
import path from "path";

export default function (ctx: GSContext) {
  const filePath = path.join(__dirname, "../../public/index.html"); // Adjust path as needed
  const htmlContent = fs.readFileSync(filePath, "utf-8");

  return {
    data: htmlContent,
    code: 200,
    success: true,
    headers: {
      "Content-Type": "text/html",
    },
  };
}
