from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915}) # Mobile viewport

    print("Loading game...")
    page.goto("http://localhost:8080")
    page.wait_for_selector("#btn-play")

    print("Starting Game...")
    page.click("#btn-play")
    page.wait_for_selector("#game-timer")

    # Wait for traffic/buildings
    print("Waiting for gameplay visuals...")
    page.wait_for_timeout(3000)

    # Move player to find a building?
    # Hard to script movement blindly.
    # Just take screenshot of spawn area (usually has props).

    page.screenshot(path="verification/gameplay_polish.png")
    print("Screenshot saved to verification/gameplay_polish.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
