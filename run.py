import os
import subprocess
import time

def run_in_new_tab(title, command):
    """
    Run a command in a new terminal tab with the given title.
    """
    subprocess.Popen([
        "gnome-terminal", 
        "--tab", 
        "--title", title, 
        "--", "bash", "-c", f"{command}; exec bash"
    ])

def main():
    kafka_dir = "/home/hardik/Desktop/kafka_2.13-3.9.0"
    project_dir = "/home/hardik/Desktop/cdc_mongo"

    commands = [
        ("Zookeeper", f"cd {kafka_dir} && bin/zookeeper-server-start.sh config/zookeeper.properties"),
        ("Kafka Broker", f"cd {kafka_dir} && bin/kafka-server-start.sh config/server.properties"),
        ("Kafka Connect", f"cd {kafka_dir} && bin/connect-distributed.sh config/connect-distributed.properties"),
        ("Godspeed", f"cd {project_dir} && npm i && godspeed serve"),
        ("Kafka Consumer", f"cd {kafka_dir} && bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mongodb.cdc_project.orders --from-beginning | jq 'select(.payload.op == \"u\")' | tee {project_dir}/output.txt")
    ]

    for title, command in commands:
        run_in_new_tab(title, command)
        time.sleep(4)  

    print("All commands have been started in separate terminal tabs.")

if __name__ == "__main__":
    main()
