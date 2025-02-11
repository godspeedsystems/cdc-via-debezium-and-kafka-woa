import { GSContext } from "@godspeedsystems/core";
import fs from "fs";

const OUTPUT_FILE = "./formatted_output.json";  // Path to the filtered JSON file

export default async function (ctx: GSContext) {
    ctx.logger.info("📡 Received request for update events...");

    try {
        if (!fs.existsSync(OUTPUT_FILE)) {
            ctx.logger.warn("❗ No updated data found.");
            return { data: [], message: "No updated events available" };
        }

        const rawData = fs.readFileSync(OUTPUT_FILE, "utf-8");
        let jsonData = rawData.trim() ? JSON.parse(rawData) : [];

        // Ensure it's an array
        if (!Array.isArray(jsonData)) {
            jsonData = [jsonData];
        }

        // Extract relevant fields from each update event
        const formattedEvents = jsonData.map(event => ({
            timestamp: event.timestamp,
            updated_fields: event.updated_fields || {},
            after: event.after || {},
        }));

        ctx.logger.info(`✅ Returning ${formattedEvents.length} updated events.`);
        return { data: formattedEvents };
    } catch (error) {
        ctx.logger.error("❌ Error reading updated data:", error);
        return { error: "Failed to fetch updated events" };
    }
}
