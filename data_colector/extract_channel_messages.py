import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options

# ⚙️ Configuration
CHANNEL_NAME = "Infos Partage"
GECKODRIVER_PATH = "/opt/homebrew/bin/geckodriver"
PROFILE_PATH = "/Users/stephanelaine/firefox-selenium-profile"  # ton profil isolé

def setup_driver():
    options = Options()
    options.add_argument("-profile")
    options.add_argument(PROFILE_PATH)
    options.add_argument("--start-maximized")
    service = Service(GECKODRIVER_PATH)
    driver = webdriver.Firefox(service=service, options=options)
    return driver

# ✅ NEW: function to click the scroll-limit button
def click_scroll_limit_button(driver):
    try:
        btn = driver.find_element(By.XPATH, '//*[@id="main"]/div[2]/div/div/div[2]/div[2]/div/span')
        if btn.is_displayed():
            btn.click()
            time.sleep(1)
            return True
    except:
        pass
    return False

def scroll_and_collect(driver, max_scrolls=20, pause=3):
    """Scroll et collecte messages, en vérifiant la progression à chaque scroll."""
    chat_box = driver.find_element(By.XPATH, '//*[@id="main"]/div[2]/div/div/div[2]')
    collected = []
    last_count = 0
    same_count = 0

    for i in range(max_scrolls):

        # (unchanged except THIS line)
        click_scroll_limit_button(driver)

        # 🔥 FIX : smooth upward scroll instead of jump-to-top
        driver.execute_script("arguments[0].scrollTop -= 500", chat_box)

        time.sleep(pause)

        msgs = chat_box.find_elements(By.XPATH, ".//div[contains(@class,'copyable-text')]")
        for msg in msgs:
            try:
                text = msg.find_element(By.XPATH, ".//span[contains(@class,'selectable-text')]").text
                timestamp = msg.get_attribute("data-pre-plain-text")
                if text and timestamp:
                    collected.append({"timestamp": timestamp, "text": text})
            except:
                continue

        # retirer doublons
        collected = list({(m["timestamp"], m["text"]): m for m in collected}.values())

        if len(collected) == last_count:
            same_count += 1
        else:
            same_count = 0
            last_count = len(collected)

        if same_count >= 5:
            print(f"[debug] Arrêt du scroll après {i+1} scrolls, total messages: {len(collected)}")
            break

    return collected

# ✅ NEW: filename includes the channel name
def save_json(data):
    filename = f"whatsapp_{CHANNEL_NAME.replace(' ', '_')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"📁 Fichier sauvegardé : {filename}")

def main():
    driver = setup_driver()
    driver.get("https://web.whatsapp.com")
    print("👉 Connecte-toi à WhatsApp Web si nécessaire…")

    wait = WebDriverWait(driver, 60)

    # 1️⃣ Cliquer sur "Channels"
    channels_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div[1]/div/div/div/div/div[3]/div/header/div/div[1]/div/div[3]/span/button"))
    )
    channels_button.click()

    # 2️⃣ Rechercher le channel
    search = wait.until(
        EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true']"))
    )
    search.click()
    search.clear()
    search.send_keys(CHANNEL_NAME)

    # 3️⃣ Cliquer sur le channel
    channel = wait.until(
        EC.element_to_be_clickable((By.XPATH, f"//span[@title='{CHANNEL_NAME}']"))
    )
    channel.click()

    time.sleep(3)

    print("⬆️ Scroll et collecte des messages…")
    data = scroll_and_collect(driver, max_scrolls=20, pause=1.5)

    save_json(data)

    print(f"✅ Terminé ! Messages enregistrés ({len(data)} messages)")
    driver.quit()

if __name__ == "__main__":
    main()
