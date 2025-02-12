#!/bin/bash

run_in_new_tab() {
    local title="$1"
    local command="$2"

    if command -v gnome-terminal &>/dev/null; then
        gnome-terminal --tab --title="$title" -- bash -c "$command; exec bash"
    elif command -v konsole &>/dev/null; then
        konsole --new-tab -e bash -c "$command; exec bash"
    elif command -v xfce4-terminal &>/dev/null; then
        xfce4-terminal --tab --title="$title" --command="bash -c '$command; exec bash'"
    elif command -v alacritty &>/dev/null; then
        alacritty -e bash -c "$command; exec bash"
    elif command -v kitty &>/dev/null; then
        kitty --title "$title" bash -c "$command; exec bash"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS Terminal.app
        osascript -e "tell application \"Terminal\" to do script \"${command}\""
    else
        echo "Error: No supported terminal found. Run manually: $command"
    fi
}

KAFKA_DIR="~/kafka_2.13-3.9.0/"  # Replace with your Kafka directory path
PROJECT_DIR="~/Code/godspeed/cdc-via-debezium-and-kafka-woa/"  # Replace with your project directory path

# Start Zookeeper
run_in_new_tab "Zookeeper" "cd $KAFKA_DIR && bin/zookeeper-server-start.sh config/zookeeper.properties"
sleep 3
# Start Kafka broker
run_in_new_tab "Kafka Broker" "cd $KAFKA_DIR && bin/kafka-server-start.sh config/server.properties"

# Start Kafka Connect (distributed mode)
run_in_new_tab "Kafka Connect" "cd $KAFKA_DIR && bin/connect-distributed.sh config/connect-distributed.properties"

# Wait for Kafka Connect to start (adjust sleep time as needed)
#sleep 10

# Navigate to the project directory and run the curl commands
run_in_new_tab "Mongo Connector" "cd $PROJECT_DIR && curl -X POST -H \"Content-Type: application/json\" --data @mongo-connector.json http://localhost:8083/connectors && curl -X GET http://localhost:8083/connectors/mongodb-connector/status"
run_in_new_tab "godspeed" "cd $PROJECT_DIR && npm i && godspeed serve"

# Start Kafka console consumer
run_in_new_tab "Kafka Consumer" "cd $KAFKA_DIR && bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mongodb.cdc_project.orders --from-beginning | jq 'select(.payload.op == \"u\")' | tee $PROJECT_DIR/output.txt"

echo "All commands have been started in separate terminal tabs."
