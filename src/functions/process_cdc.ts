import { GSContext, PlainObject } from "@godspeedsystems/core";

export async function filter_recent_status_changes(ctx: GSContext, args: PlainObject) {
    const events = args;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const filteredEvents = events.filter((event: PlainObject) => {
        const isRecent = new Date(event.createdAt) > oneHourAgo;
        const statusChanged = event.before?.status !== event.after?.status;

        return isRecent && statusChanged;
    });

    ctx.logger.info("Filtered events: %o", filteredEvents);
    return filteredEvents;
}

export async function handle_filtered_events(ctx: GSContext, args: PlainObject) {
    const filteredEvents = args;

    filteredEvents.forEach((event: PlainObject) => {
        ctx.logger.info(`Handling event for order: ${event.after.orderId}`);
    });

    return { status: "success", processed: filteredEvents.length };
}