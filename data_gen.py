import json
import random
from datetime import datetime, timedelta

# Generate random data for the Orders collection
def generate_sample_orders(num_orders=100):
    statuses = ["pending", "shipped", "delivered"]
    items_list = [
        {"name": "Laptop", "price": 1000},
        {"name": "Mouse", "price": 20},
        {"name": "Keyboard", "price": 50},
        {"name": "Monitor", "price": 200},
        {"name": "Phone", "price": 800},
    ]
    
    orders = []
    for i in range(1, num_orders + 1):
        order = {
            "orderId": f"ORD-{i:05d}",
            "customerId": f"CUST-{random.randint(1, 50):03d}",
            "status": random.choice(statuses),
            "items": [
                {
                    "name": random.choice(items_list)["name"],
                    "quantity": random.randint(1, 5),
                }
                for _ in range(random.randint(1, 5))
            ],
            "createdAt": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            "updatedAt": datetime.now().isoformat(),
        }
        orders.append(order)
    
    return orders

# Generate and save data to a JSON file
sample_orders = generate_sample_orders(100)
with open("sample_orders.json", "w") as f:
    json.dump(sample_orders, f, indent=4)
print("Sample data saved to 'sample_orders.json'")
