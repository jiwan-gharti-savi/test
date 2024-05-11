def test_search_pa_draft_claims_draft_patent(logged_in_session):
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    import platform
    from selenium.webdriver.common.action_chains import ActionChains
    import time
    
    driver = logged_in_session
    
    wait = WebDriverWait(driver, 50)
    wait1 = WebDriverWait(driver, 300)

    # typing invenction text
    input_box_text = driver.find_element(By.CLASS_NAME, "textarea1")
    input_box_text.send_keys("Invention is an iontophoretic device for enhanced transport of substances through the skin. In my invention two electrical transportation fields with different directions are applied. These field are orthogonal and parallel to the skin surface, respectively, and applied in a temporally alternating sequence. Substances are thus transported in an optimal way on their meandering paths through the stratum corneum into or out of the skin. The iontophoretic device preferably comprises an array of electrodes to which either a spatially alternating pattern of electrical potentials can be applied or which can alternatively be divided into two groups of neighboring electrodes that are connected to the same potential. The iontophoretic device may particularly be integrated into any skin- contacting device e.g. an electrical shaver or an epilator.")

    # wait till pa buttion available and search for pa
    wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "explore-prior-art")))
    expolre_prior_art_button_action = driver.find_element(By.CLASS_NAME, "explore-prior-art")
    action_chains = ActionChains(driver)
    action_chains.move_to_element(expolre_prior_art_button_action).click().perform()

    time.sleep(15)
    # wait till results are available
    wait1.until(EC.visibility_of_element_located((By.CLASS_NAME, "prior_art_summary")))

    results_length = 0
    # checking at lease one result available
    if(driver.find_element(By.CSS_SELECTOR, ".prior_art_summary > .novelty_header")):
        results_list = driver.find_elements(By.CLASS_NAME, "epp-data-section")
        results_length = len(results_list)
        
    assert results_length > 0, \
        f"At least one result should be available"

    # generating claims
    if(driver.find_element(By.CLASS_NAME, "pa-draft-claims")):
        pa_draft_claims_button_action = driver.find_element(By.CLASS_NAME, "pa-draft-claims")
        action_chains = ActionChains(driver)
        action_chains.move_to_element(pa_draft_claims_button_action).click().perform()

        time.sleep(5)

        claimsGenerated = False
        print("claims_generated")
        # checking claims are generate or not
        if(driver.find_element(By.CLASS_NAME, "skeleton-small-box")):
            wait1.until(EC.visibility_of_element_located((By.CLASS_NAME, "claims_generated")))
            claimsGenerated = True
        print("claims_generated")
        print(claimsGenerated)
        assert claimsGenerated, \
            f"Claims generation failed"

        time.sleep(5)

        # initating drafing patent
        if(driver.find_element(By.CLASS_NAME, "pa_draft_patent_button")):
            pa_draft_patent_button_action = driver.find_element(By.CLASS_NAME, "pa_draft_patent_button")
            action_chains = ActionChains(driver)
            action_chains.move_to_element(pa_draft_patent_button_action).click().perform()
        else:
            assert False, \
                f"Draft Patent button not available"
    else:
        assert False, \
            f"Draft Claims button not available"

