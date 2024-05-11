#!/bin/sh
cd .github/hooks
# Load variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi
cd ../..
# Fallback to python3 from PATH if PYTHON_EXEC is not set
PYTHON_EXEC=${PYTHON_ENV_EXEC:-$(which python3)}
cd services
# Check if the Python executable is valid
if ! command -v "$PYTHON_EXEC" &> /dev/null
then
    echo "Python executable ($PYTHON_EXEC) could not be found"
    exit 1
fi

# Python tests and coverage
echo "Running Python tests and generating coverage report..."
echo "Python Env: $PYTHON_ENV_EXEC"
echo "Python Command: $PYTHON_EXEC"

# Running the tests using coverage with the specified Python executable
$PYTHON_EXEC -m coverage run -m pytest -s
if [ $? -ne 0 ]; then
  echo "Python tests failed, aborting commit."
  exit 1
fi

# Generating the coverage report with the specified Python executable
$PYTHON_EXEC -m coverage report -m --fail-under=75
if [ $? -ne 0 ]; then
  echo "Python code coverage is below 75%, aborting commit."
  exit 1
fi

# Generating the HTML report with the specified Python executable
$PYTHON_EXEC -m coverage html
cd ..

# # Node.js tests and coverage
# echo "Running Node.js tests and generating coverage report..."
# npx nyc --check-coverage --lines 90 npm test
# if [ $? -ne 0 ]; then
#   echo "Node.js tests failed or code coverage is below 90%, aborting commit."
#   exit 1
# fi
