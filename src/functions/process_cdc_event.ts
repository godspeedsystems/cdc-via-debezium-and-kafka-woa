import { GSContext, PlainObject, GSStatus } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
    ctx.logger.info("Received CDC Event", args);

    const eventPayload = args.payload;

    // Extract operation type (insert, update, delete)
    const operation = eventPayload.op;
    const document = eventPayload.after || eventPayload.before;

    ctx.logger.info(`Operation: ${operation}`);
    ctx.logger.info(`Document: ${JSON.stringify(document)}`);

    // Perform necessary actions based on event type
    if (operation === "u") {
        ctx.logger.info("Processing update event...");
        // Handle update event
    } else if (operation === "c") {
        ctx.logger.info("Processing insert event...");
        // Handle insert event
    } else if (operation === "d") {
        ctx.logger.info("Processing delete event...");
        // Handle delete event
    }

    return new GSStatus(true, 200, "CDC Event processed successfully", {});
}

