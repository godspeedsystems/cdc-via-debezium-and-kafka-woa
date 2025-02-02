import { GSContext } from "@godspeedsystems/core";
import fs from "fs/promises";

const INPUT_FILE = "./output.json";  // Path to Debezium output
const OUTPUT_FILE = "./updated_data.json";  // Path for filtered updates

export default async function (ctx: GSContext) {
    try {
        ctx.logger.info("Filtering updated events...");
        // Ensure the input file exists
        try {
            await fs.access(INPUT_FILE);
        } catch (err) {
            ctx.logger.warn("Input file does not exist. Skipping filtering.");
            return { message: "No input file found. Skipping filtering." };
        }

        // Read and parse the CDC file
        const rawData = await fs.readFile(INPUT_FILE, "utf-8");
        if (!rawData.trim()) {
            ctx.logger.warn("Input file is empty.");
            return { message: "Input file is empty. No updates to process." };
        }

        let events;
        try {
            events = JSON.parse(rawData);
            if (!Array.isArray(events)) {
                throw new Error("Invalid JSON structure: Expected an array.");
            }
        } catch (error) {
            ctx.logger.error("Error parsing input JSON:", error);
            return { error: "Invalid input JSON format." };
        }

        // Filter only "update" events (op: "u") and parse the 'after' field correctly
        const updatedEvents = events
            .filter(event => event?.payload?.op === "u" && event?.payload?.after)
            .map(event => {
                try {
                    return JSON.parse(event.payload.after); // Convert stringified JSON into an object
                } catch (error) {
                    ctx.logger.warn("Skipping malformed 'after' field:", event.payload.after);
                    return null;
                }
            })
            .filter(event => event !== null); // Remove failed parses

        if (updatedEvents.length === 0) {
            ctx.logger.info("No updated events found.");
            return { message: "No updated events found." };
        }

        // Write filtered data to the new JSON file
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(updatedEvents, null, 2));

        ctx.logger.info(`Filtered ${updatedEvents.length} updated events successfully.`);
        return { message: "Updated events extracted successfully", count: updatedEvents.length };
    } catch (error) {
        ctx.logger.error("Error filtering updates:", error);
        return { error: "Failed to process updated events", details: error.message };
    }
}
