# **CDC-via-debezium-and-Kafka-woa**<img align="right" width="180" src="public/image.png" alt="fork this repository" />

## **Innovators/Developers​**
- Hardik Jindal 
- Sagar Arora 

## **Mentor**
- Ayush Ghai 
- **Email**: ayush@godspeed.systems
- **Discord**: ayush.ghai

use the below command to setup and start the kafka server
```
#Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

#Kafka broker
bin/kafka-server-start.sh config/server.properties

# Start Kafka Connect (distributed or standalone mode)
bin/connect-distributed.sh config/connect-distributed.properties
```

use to deploy the connector
```
curl -X POST -H "Content-Type: application/json" \
--data @mongo-connector.json \
http://localhost:8083/connectors
```
to check if the connector is running or not
```
curl -X GET http://localhost:8083/connectors/mongodb-connector/status
```
use the below command to view the changes in real time, this will save the output in `output.json` file
```
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mongodb.cdc_project.orders --from-beginning | jq 'select(.payload.op == "u")' | tee /home/hardik/Desktop/cdc_mongo/output.txt

```
