import { GSContext } from "@godspeedsystems/core";
import fs from "fs";

const OUTPUT_FILE = "./updated_data.json";  // Path to the filtered JSON file

export default async function (ctx: GSContext) {
    try {
        // Check if the file exists before reading
        if (!fs.existsSync(OUTPUT_FILE)) {
            ctx.logger.warn("File does not exist, returning empty data.");
            return { data: [], message: "No updated events available" };
        }

        // Read and parse the JSON file
        const rawData = fs.readFileSync(OUTPUT_FILE, "utf-8");
        const jsonData = rawData.trim() ? JSON.parse(rawData) : [];

        return { data: jsonData, message: "Updated events fetched successfully" };
    } catch (error) {
        ctx.logger.error("Error reading updated data:", error);
        return { error: "Failed to fetch updated events", details: error.message };
    }
}
