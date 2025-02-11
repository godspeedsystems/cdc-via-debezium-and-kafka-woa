from flask import Flask, jsonify
import json
import re
import os
import threading
import time

app = Flask(__name__)

# Define file paths
INPUT_FILE = "output.txt"
OUTPUT_FILE = "formatted_output.json"

def extract_payloads():
    """Extracts payload JSON objects from the raw text file."""
    if not os.path.exists(INPUT_FILE):
        return {"error": "Input file not found"}

    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        raw_text = file.read()

    # Find all payload blocks using regex
    payloads = re.findall(r'"payload":\s*({.*?})\s*}', raw_text, re.DOTALL)

    extracted_data = []

    for payload in payloads:
        try:
            # Parse payload as JSON
            payload_json = json.loads(payload)

            # Filter only updates (`op: "u"`)
            if payload_json.get("op") == "u":
                extracted_data.append(payload_json)

        except json.JSONDecodeError:
            continue  # Skip malformed payloads

    if not extracted_data:
        return {"error": "No valid update events found"}

    # Save the extracted data as a properly formatted JSON array
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        json.dump(extracted_data, outfile, indent=4)

    return extracted_data

@app.route('/process-json', methods=['GET'])
def process_json():
    """API endpoint to manually trigger JSON processing."""
    result = extract_payloads()
    return jsonify(result)

def auto_process():
    """Runs extract_payloads() every 5 seconds in the background."""
    while True:
        print("🔄 Auto-processing JSON data...")
        extract_payloads()
        time.sleep(1)  # Wait for 5 seconds before running again

# Start background thread
threading.Thread(target=auto_process, daemon=True).start()

if __name__ == '__main__':
    app.run(debug=True)
