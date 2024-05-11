To setup follow this one i have also followed this one 

# Test Automation Setup

This guide provides step-by-step instructions for setting up test automation in your project.

## Set Up a Virtual Environment

It's recommended to create a virtual environment to isolate dependencies.

1. Open a terminal or command prompt.
2. Navigate to the project root folder.
3. Run the following command to create a virtual environment:
   shell
   python -m venv venv
4. Activate the virtual environment:
   shell
   source venv/bin/activate

## Install Selenium
1. Open a terminal or command prompt.
2. Run the following command:
   shell
   pip install selenium==4.9.1

## Set Up Folder Structure
1. Create a root folder for your test automation project.
2. Inside the root folder, create the following directories:
   shell
   ├── application
   │   ├── acceptance
   │   ├── functional
   │   ├── integration
   │   └── performance
   └── api
       ├── solr
       │   └── search
       └── other

## Additional Steps

1. Install Python Modules: In the activated virtual environment, install the required Python modules using pip. Common modules for test automation include pytest, pytest-html, selenium, webdriver_manager, etc.

2. Example command to install pytest and other required modules:
   shell
   pip install pytest pytest-html selenium==4.9.1 webdriver_manager coverage Pillow

3. Create conftest.py File: Create a file named conftest.py inside the project root folder. This file is used for configuring pytest and can contain fixtures and other customizations.

4. Create run_tests.py File: Create a file named run_tests.py in the project root folder. Inside this file, define the test runner and provide necessary parameters. An example content for run_tests.py can be:
    shell
    import pytest
    if _name_ == "__main__":
        pytest.main(["-v", "-s", "--html=reports/test_report.html", "--self-contained-html"])

5. Webdrivers setup - download the chrome webdriver from the following link and keep it in webdirvers/chrome folder and update the path of WEBDRIVER_CHROME in configtest.py
   
   https://chromedriver.chromium.org/downloads

6. if the system is MAC, you need to give permission to open the webdrivers application as the wedrivefrs developer is not recognized developer. Need to do in the Privicy & Security. 

## Run the Tests
To run the tests:

1. Open a terminal or command prompt.
2. Activate the virtual environment (if not already activated).
3. Navigate to the project root folder.
4. Run the following command to execute the tests:
    ```shell
   python run_tests.py

#Docs

Following functions are important.

1. Wait for a dom/html element to load

         wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "CodeMirror-code")))

2. Interact with search box

         code_mirror = driver.find_element(By.CLASS_NAME, "CodeMirror")
         code_line = code_mirror.find_elements(By.CLASS_NAME, "CodeMirror-line")[0]
         code_line.click()
         search_box = code_mirror.find_element(By.CSS_SELECTOR, "textarea")

3. Find element/elements using class name

         driver.find_element(By.CLASS_NAME, "CodeMirror-hint")
         driver.find_elements(By.CLASS_NAME, "CodeMirror-hint")

4. Find element/elements using CSS path

         driver.find_element(By.CSS_SELECTOR, ".sc_search_icon img")
         wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".pcsa_charts .create_new")))

5. Click on a html element

         from selenium.webdriver.common.action_chains import ActionChains
         pick_chart = random.choice(chart_ids)
         chart_element = driver.find_element(By.CSS_SELECTOR, f".{pick_chart} .pcsao_inner")
         bars = chart_element.find_elements(By.CSS_SELECTOR, ".echarts-for-react canvas")
         random_bar = random.choice(bars)
         Perform the click action using Selenium's ActionChains
         action_chains = ActionChains(driver)
         action_chains.move_to_element(random_bar).click().perform()