import coverage
import os
import pytest
if __name__ == "__main__":
    cov = coverage.Coverage()
    cov.start()

    # Define the paths to related to the login test cases
    login_test_directories = [
        # "tests/application/functional/login"
    ]

    # Define the paths related to the API test cases
    api_test_directories = [
        # "tests/api/other",
    ]

    # Define the paths related to the API test cases
    app_test_directories = [
        "tests/application/functional/login",
        "tests/application/functional/search"
    ]

    # Create the reports directory if it doesn't exist
    os.makedirs("reports", exist_ok=True)

    # Construct the pytest command with the HTML report option
    # pytest_args = [
    #     "-v",
    #     "-s",
    #     "--html=reports/test_report.html",
    #     "--self-contained-html",
    # ] + login_test_directories

    # # Execute pytest with the constructed command
    # pytest.main(pytest_args)

     # Construct the pytest command with the HTML report option
    # pytest_args = [
    #     "-v",
    #     "-s",
    #     "--html=reports/test_report.html",
    #     "--self-contained-html",
    # ] + app_test_directories

    # # Execute pytest with the constructed command
    # pytest.main(pytest_args)

     # Construct the pytest command with the HTML report option
    pytest_args = [
        "-v",
        "-s",
        "--html=reports/test_report.html",
        "--self-contained-html",
    ] + app_test_directories

    # Execute pytest with the constructed command
    pytest.main(pytest_args)

    cov.stop()
    cov.report()
    cov.html_report(directory='htmlcov')
    cov.save()