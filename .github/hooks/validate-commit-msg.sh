#!/bin/sh

# This script validates the commit message to ensure it follows best practices.
# - The commit message must start with a Jira issue key e.g. "DIPA-123".
# - The commit message should be able to update Jira issue using smart commits.

# This regex matches Jira issue keys at the start of the commit message.
JIRA_REGEX='DIPA-[0-9]+.*'

# Extract the commit message.
message=$(cat "$1")

# Check if the commit message starts with a Jira issue key.
if ! [[ $message =~ $JIRA_REGEX ]]; then
    echo "Error: Your commit message must start with a JIRA issue key (e.g., DIPA-123)"
    exit 1
fi

# Encouraging a commit message of at least 20 characters to ensure meaningful information.
if [[ ${#message} -lt 20 ]]; then
    echo "Warning: Consider writing a more descriptive commit message."
fi

# Success, the commit message is valid.
exit 0
