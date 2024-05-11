import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

import urllib.parse
import time

APP_URL = "http://localhost:3000/auth"
# WEBDRIVER_CHROME = "webdrivers/chrome/114_mac_64/chromedriver"
WEBDRIVER_CHROME = "webdrivers/chrome/114_mac_arm_64/chromedriver"



# Define common fixtures or configuration settings if needed
@pytest.fixture(scope="function")
def setup():
    # Initialize the WebDriver
    options = webdriver.ChromeOptions()
    # Add any desired options or arguments to the options object
    options.add_argument('--no-sandbox')

    #for headeless testing - not to open browser
    options = Options()
    options.add_argument("--headless")

    # Initialize the WebDriver
    driver = webdriver.Chrome(executable_path=WEBDRIVER_CHROME, options=options)

    yield driver

    # Teardown - Stop the WebDriver
    driver.quit()

@pytest.fixture(scope="function")
def logged_in_session():

    # Initialize the WebDriver
    options = webdriver.ChromeOptions()

    #for headeless testing - not to open browser
    options = Options()
    options.add_argument("--headless")

    driver = webdriver.Chrome(executable_path=WEBDRIVER_CHROME, options=options)


    # Perform login
    driver.get(APP_URL)

    wait = WebDriverWait(driver, 100)
    if(APP_URL == "http://localhost:3000/auth"):

        login_page = wait.until(EC.url_contains("auth"))
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "auth0_login_button")))

        login_button = driver.find_element(By.CLASS_NAME, "auth0_login_button")
        # print(login_button.text)
        action_chains = ActionChains(driver)
        action_chains.move_to_element(login_button).click().perform()


        # Enter the email address
        email_input = driver.find_element("id", "username")
        email_input.send_keys("shaik@dolcera.com")

        # Click on the next button
        # next_button = driver.find_element("id", "checkmail")
        # next_button.click()
        time.sleep(2)
        # Verify that password input is displayed
        password_input = driver.find_element("id", "password")
        assert password_input.is_displayed()

        # Enter the password
        password_input.send_keys("Basha@638")
        password_input.send_keys(Keys.ENTER)
        
        # continue_button = driver.find_element(By.CSS_SELECTOR, 'button')
        # print(continue_button)
        # print(continue_button.text)
        # action_chains = ActionChains(driver)
        # action_chains.move_to_element(continue_button).click().perform()
        # time.sleep(50)
        # Submit the login form
        # submit_button = driver.find_element("id", "regularsubmit")
        # submit_button.click()

        wait = WebDriverWait(driver, 100)
        login_page = wait.until(EC.url_contains("/home"))
    else:
        login_page = wait.until(EC.url_contains("/projects"))        
    # expected_url = APP_URL+"/#/search"
    # actual_url = driver.current_url
    
    # expected_url_normalized = urllib.parse.urljoin(expected_url, '/')
    # actual_url_normalized = urllib.parse.urljoin(actual_url, '/')

    # # Assertions
    # assert actual_url_normalized == expected_url_normalized
    # assert "Patent Categorization System" in driver.page_source  # Replace with the expected welcome message

    # Return the logged-in session
    yield driver

    # Teardown - Stop the WebDriver
    driver.quit()

@pytest.fixture(scope="module")
def api_session():
    APP_URL = "http://localhost:3000"