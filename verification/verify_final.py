from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915}) # Mobile viewport

    # 1. Load Game
    print("Loading game...")
    page.goto("http://localhost:8080")
    page.wait_for_selector("h1.game-title")

    # 2. Check Warning Message
    print("Checking Police Warning...")
    warning = page.locator(".police-warning")
    if warning.is_visible():
        print("Warning visible (Correct).")
    else:
        print("ERROR: Warning missing.")

    # 3. Check Missions
    print("Checking Missions...")
    missions = page.locator("#mission-list li")
    count = missions.count()
    if count == 3:
        print(f"Found {count} missions (Correct).")
    else:
        print(f"ERROR: Found {count} missions, expected 3.")

    page.screenshot(path="verification/menu_aaa.png")

    # 4. Start Game
    print("Starting Game...")
    page.click("#btn-play")
    page.wait_for_selector("#screen-hud.active")

    # 5. Wait for traffic
    print("Waiting for traffic to spawn...")
    page.wait_for_timeout(5000)

    page.screenshot(path="verification/gameplay_traffic.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
