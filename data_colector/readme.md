📦 WhatsApp Channel Scraper (Selenium + Firefox)
This project is a WhatsApp Web Channel message scraper built with Python and Selenium.
It automatically:


Opens WhatsApp Web with a dedicated Firefox profile


Navigates to the Channels section


Searches for the specific channel (e.g., "Infos Partage")


Scrolls up to load older posts


Automatically clicks the "scroll limit" button when WhatsApp blocks scrolling


Collects all available messages with timestamps


Saves everything as a JSON file named after the channel



🚀 Features


✔️ Works with a real Firefox session (keeps your login)


✔️ Detects scroll limits and clicks the “Load more” button


✔️ Avoids duplicates while collecting


✔️ Saves messages in clean JSON format


✔️ Fully automatic after initial login



🧰 Requirements
Install these before running the script:
Python libraries
pip install selenium

System dependencies


Firefox


Geckodriver
(Ensure it matches your Firefox version)


On macOS (Homebrew):
brew install geckodriver


📁 Project Structure
whatsapp-scraper/
│
├── scraper.py        # Your full script
├── README.md         # Documentation
└── whatsapp_Infos_Partage.json   # (Generated output)


⚙️ Configuration
Inside the script:
CHANNEL_NAME = "Infos Partage"
GECKODRIVER_PATH = "/opt/homebrew/bin/geckodriver"
PROFILE_PATH = "/Users/stephanelaine/firefox-selenium-profile"

🔐 Firefox Profile
Use an isolated Firefox profile dedicated to Selenium.
This keeps you logged in to WhatsApp Web and avoids repeated QR scans.
To create one:
firefox --ProfileManager

Then select the path and update PROFILE_PATH.

▶️ How to Run


Open a terminal inside the project directory.


Run:


python scraper.py



Firefox will open:


Log in to WhatsApp Web once if needed.




The script will:


Navigate to "Channels"


Search for your channel name


Load all messages by scrolling


Save results to JSON




Output file example:
whatsapp_Infos_Partage.json


📝 Output Format
Each message is saved as:
{
    "timestamp": "[12:32, 28/11/2025] ",
    "text": "Your message content here"
}


🔍 How It Works (Quick Explanation)
1. Setup Selenium + Firefox
Loads your profile and opens WhatsApp Web.
2. Go to Channels
Clicks the Channels tab and searches for the target channel.
3. Scroll Logic
The script repeatedly scrolls upward to load old messages:
driver.execute_script("arguments[0].scrollTop = 0", chat_box)

4. Scroll Limit Button
WhatsApp sometimes displays a button that must be clicked to continue scrolling.
The script detects and clicks it automatically:
click_scroll_limit_button(driver)

5. Message Extraction
Each message found in the DOM is parsed for:


Timestamp (data-pre-plain-text)


Content text (selectable-text)


6. Deduplication
Messages are stored in a dictionary to avoid duplicates.
7. Save to JSON
Automatically names the file according to the channel.

🛡️ Notes & Limitations


WhatsApp may rate-limit scrolling if done too fast


Complex media messages (images, videos) are not scraped


Script must be re-run manually if WhatsApp Web UI changes


Works only on WhatsApp Channels, not regular chats



📘 License
Free to use, modify, and improve!

If you want, I can also generate:
✅ A version optimized for speed
✅ A version that collects images/media
✅ A version that supports multiple channels in one run
Just tell me!