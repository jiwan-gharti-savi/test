def test_login(logged_in_session):
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    import platform
    from selenium.webdriver.common.action_chains import ActionChains
    import time
    # print(json_data)
    # print("hello filters")
    driver = logged_in_session
    
    wait = WebDriverWait(driver, 5)

    wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "landing-page-title")))
    