import { GSContext } from "@godspeedsystems/core";
import fs from "fs";

const INPUT_FILE = "./output.json";  // Path to Debezium CDC output
const OUTPUT_FILE = "./updated_data.json";  // Path for filtered updates

export default async function (ctx: GSContext) {
    ctx.logger.info("🔄 [filter_updates] Filtering updated events...");

    try {
        if (!fs.existsSync(INPUT_FILE)) {
            ctx.logger.warn("❗ [filter_updates] No CDC file found.");
            return { message: "No CDC data available" };
        }

        const rawData = fs.readFileSync(INPUT_FILE, "utf-8");
        // ctx.logger.debug("📄 [filter_updates] Raw data read from file:\n" + rawData);

        // Step 1: Normalize the JSON
        const sanitizedData = rawData
            .replace(/}\s*{/g, "},{") // Convert `}{` into `},{` to create an array-like structure
            .replace(/"payload":/g, "\"data\":"); // Replace duplicate `payload` keys with unique ones
        
        const jsonArray = `[${sanitizedData}]`;

        let events;
        try {
            events = JSON.parse(jsonArray);
        } catch (err) {
            ctx.logger.error("❌ [filter_updates] Error parsing input JSON:", err);
            return { error: "Invalid JSON format even after fixing." };
        }

        // Step 2: Filter for updates
        const updatedEvents = events
            .filter(event => event.data?.op === "u") // Ensure 'data' exists and op is "u"
            .map(event => {
                try {
                    return JSON.parse(event.data.after); // Convert escaped JSON string to object
                } catch (error) {
                    ctx.logger.error("❌ [filter_updates] Failed to parse 'after' JSON:", error);
                    return null; // Skip malformed data
                }
            })
            .filter(Boolean); // Remove null values from failed parses

        // Step 3: Save filtered updates
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedEvents, null, 2));

        ctx.logger.info(`✅ [filter_updates] Processed ${updatedEvents.length} updated events.`);
        return { message: "Updated events extracted successfully", count: updatedEvents.length };
    } catch (error) {
        ctx.logger.error("❌ [filter_updates] Error:", error);
        return { error: "Failed to process updated events" };
    }
}
