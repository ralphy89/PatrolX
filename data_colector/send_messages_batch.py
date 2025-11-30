import json
import requests
import sys
import time
from datetime import datetime

def parse_timestamp(timestamp_str):
    # Format: "[1:25 PM, 11/24/2025] Infos Partage: "
    # We need to strip the brackets and the suffix
    clean_str = timestamp_str.replace("[", "").split("]")[0]
    try:
        return datetime.strptime(clean_str, "%I:%M %p, %m/%d/%Y")
    except ValueError:
        # Handle cases where timestamp might be malformed or different
        # print(f"Warning: Could not parse timestamp: {timestamp_str}")
        return datetime.min

def send_messages_batch(json_file_path, api_url, batch_size=20, interval_seconds=900):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            messages = json.load(f)
        
        # Sort messages by timestamp descending (most recent first)
        print("Sorting messages by timestamp (most recent first)...")
        messages.sort(key=lambda x: parse_timestamp(x['timestamp']), reverse=True)
        
        total_messages = len(messages)
        print(f"Total messages to send: {total_messages}")
        
        for i in range(0, total_messages, batch_size):
            batch = messages[i:i + batch_size]
            print(f"\nSending batch {i // batch_size + 1} (Messages {i+1} to {min(i+batch_size, total_messages)})...")
            
            payload = {"messages": batch}
            headers = {'Content-Type': 'application/json'}
            
            try:
                response = requests.post(api_url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    print("Batch sent successfully!")
                    print(response.json())
                else:
                    print(f"Failed to send batch. Status code: {response.status_code}")
                    print(response.text)
            except requests.exceptions.RequestException as e:
                print(f"Error connecting to API: {e}")
            
            # Wait for the next interval if there are more messages
            if i + batch_size < total_messages:
                print(f"Waiting {interval_seconds} seconds ({interval_seconds/60} minutes) before next batch...")
                time.sleep(interval_seconds)
                
        print("\nAll messages sent.")
            
    except FileNotFoundError:
        print(f"Error: File not found at {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_file_path}")

if __name__ == "__main__":
    # Default values
    DEFAULT_JSON_FILE = "whatsapp_Infos_Partage.json"
    DEFAULT_API_URL = "https://px-rho.vercel.app/messages"
    
    json_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_JSON_FILE
    url = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_API_URL
    
    send_messages_batch(json_file, url)
