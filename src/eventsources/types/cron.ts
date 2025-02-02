import { GSEventSource } from "@godspeedsystems/core/dist/core/_interfaces/sources";
import { GSCloudEvent, GSStatus, GSActor } from "@godspeedsystems/core";
import { PlainObject } from "@godspeedsystems/core";
import cron from "node-cron";

export default class EventSource extends GSEventSource {
    protected initClient(): Promise<PlainObject> {
        return Promise.resolve(cron);
    }

    subscribeToEvent(
        eventKey: string,
        eventConfig: PlainObject,
        processEvent: (
            event: GSCloudEvent,
            eventConfig: PlainObject
        ) => Promise<GSStatus>
    ): Promise<void> {
        let [, schedule, timezone] = eventKey.split(".");
        let client = this.client;
        
        if (client) {
            try {
                client.schedule(
                    schedule,
                    async () => {
                        const event = new GSCloudEvent(
                            "id",
                            eventKey,
                            new Date(),
                            "cron",
                            "1.0",
                            {},
                            "cron",
                            new GSActor("user"),
                            {}
                        );
                        await processEvent(event, eventConfig);
                        return Promise.resolve();
                    },
                    { timezone }
                );
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
        return Promise.resolve();
    }
}

const SourceType = "ES";
const Type = "cron"; // This is the loader file of the plugin
const CONFIG_FILE_NAME = "cron"; // The event identifier
const DEFAULT_CONFIG = {};

export { EventSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
