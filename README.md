# **Real-Time Change Data Capture (CDC) with Debezium & Kafka**
**Monitor database changes in real-time using Kafka & Debezium**  

## **📌 Overview**
This project implements a **real-time Change Data Capture (CDC) system** using **MongoDB, Kafka, and Debezium**. Inspired by Hasura’s GraphQL subscriptions, this system enables event-driven architectures by capturing **database changes** (INSERT, UPDATE, DELETE) and publishing them to Kafka topics.

<img align="right" width="180" src="public/image.png" alt="fork this repository" />

## **Innovators/Developers​**
- Hardik Jindal 
- Sagar Arora 

## **Mentor**
- Ayush Ghai 
- **Email**: ayush@godspeed.systems
- **Discord**: ayush.ghai

---

✅ **Key Features:**  
✔ **Capture real-time database changes** using Debezium  
✔ **Stream changes to Kafka** for event-driven processing  
✔ **Filter database changes before publishing to Kafka**  
✔ **Process Kafka topics using Kafka Streams**  
✔ **Enable real-time analytics & microservices communication**  

---

## **🛠 Tech Stack**
- **MongoDB** - NoSQL database for change tracking  
- **Apache Kafka** - Distributed event streaming platform  
- **Debezium** - CDC tool for capturing database changes  
- **Kafka Connect** - Integration framework for Kafka  
- **Kafka Streams** - Real-time stream processing  
- **Zookeeper** - Service discovery & configuration  

---

## **📖 Architecture**
1️⃣ **Debezium** monitors MongoDB’s **oplog (transaction logs)**.  
2️⃣ Changes are **captured** and **published** to Kafka topics.  
3️⃣ Kafka acts as a **central event bus**, enabling real-time processing.  
4️⃣ Kafka Streams can **filter, transform, and route messages**.  
5️⃣ Applications can **subscribe** to filtered topics for real-time updates.  

---

## **🔧 Setup & Installation**
### **1️⃣ Start Zookeeper**
Kafka requires **Zookeeper** for coordination.
```sh
bin/zookeeper-server-start.sh config/zookeeper.properties
```
```sh
# Set your MongoDB credentials in an environment file
export MONGO_USER="your_username"
export MONGO_PASSWORD="your_password"
```


### **2️⃣ Start Kafka Broker**
```sh
bin/kafka-server-start.sh config/server.properties
```

### **3️⃣ Start Kafka Connect**
Kafka Connect allows us to use **Debezium** to capture database changes.
```sh
bin/connect-distributed.sh config/connect-distributed.properties
```

### **4️⃣ Register MongoDB Connector**
To set up **Debezium MongoDB Connector**, send a **POST request**:
```sh
curl -X POST -H "Content-Type: application/json" \
     --data @mongo-connector.json \
     http://localhost:8083/connectors
```
🔹 **`mongo-connector.json` Example**  
```json
{
  "name": "mongodb-connector",
  "config": {
    "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
    "mongodb.connection.string": "mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@godspeed.tz65a.mongodb.net/",
    "tasks.max": "1",
    "mongodb.hosts": "rs0/localhost:27017",
    "mongodb.name": "godspeed",
    "mongodb.user": "<USERNAME>",
    "mongodb.password": "<PASSWORD>",
    "database.include.list": "cdc_project",
    "collection.include.list": "cdc_project.orders",
    "snapshot.mode": "initial",
    "tombstones.on.delete": "false",
    "topic.prefix": "mongodb"
  }
}
```
✔ **Debezium will now monitor the `orders` collection in MongoDB**.  

### **5️⃣ Check Connector Status**
```sh
curl -X GET http://localhost:8083/connectors/mongodb-connector/status
```
🔹 **Expected Output:**
```json
{
  "name": "mongodb-connector",
  "connector": { "state": "RUNNING" },
  "tasks": [{ "state": "RUNNING" }]
}
```

---

## **📡 Listening to Kafka Topics**
To verify that MongoDB changes are captured:
```sh
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
     --topic mongodb.cdc_project.orders --from-beginning | jq
```
| **Operation** | **Description** |
|--------------|----------------|
| `c`  | **Create** (New document inserted) |
| `u`  | **Update** (Existing document modified) |
| `d`  | **Delete** (Document removed) |
| `r`  | **Read Snapshot** (Initial database snapshot) |

🔹 Example query to filter **only deletes**:
```sh
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
     --topic mongodb.cdc_project.orders --from-beginning | jq 'select(.payload.op == "d")'
```


### **Filter Kafka Messages for Updates Only**
```sh
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
     --topic mongodb.cdc_project.orders --from-beginning | jq 'select(.payload.op == "u")' \
     | tee /home/user/cdc_mongo/output.txt
```
🔹 **Expected Output (Update Event)**:
```json
{
  "payload": {
    "op": "u",
    "after": {
      "_id": "664a8d1...",
      "status": "shipped",
      "amount": 2500
    }
  }
}
```
✔ **Only update (`op: "u"`) events will be logged**.  

---

## **📜 Kafka Stream Processing**
If you want **additional filtering & transformations**, use **Kafka Streams**:
```java
KStream<String, JsonNode> sourceStream = builder.stream("mongodb.cdc_project.orders");
KStream<String, JsonNode> filteredStream = sourceStream.filter(
    (key, value) -> value.get("payload").get("op").asText().equals("u")
);
filteredStream.to("mongodb.cdc_project.filtered_orders");
```
✔ **Filtered Kafka topic will contain only "update" (`u`) events.**

---

## **🛠 Debugging & Troubleshooting**
### **Check Logs for Errors**
```sh
docker logs kafka-connect
```

### **Restart Connector**
```sh
curl -X POST http://localhost:8083/connectors/mongodb-connector/restart
```

### **Delete & Recreate Connector**
```sh
curl -X DELETE http://localhost:8083/connectors/mongodb-connector
```
Then re-run:
```sh
curl -X POST -H "Content-Type: application/json" \
     --data @mongo-connector.json \
     http://localhost:8083/connectors
```

---

## **🙌 Thank You for Using CDC with Kafka & Debezium!**  
💬 Need help? **Open an issue or reach out!** 🚀🔥  

---
