#!/bin/bash

# Loop to publish messages
for ((i = 1; i <= 10000; i++)); do
    redis-cli publish project:1:regenerate_claim_1:stream "Message $i"
    redis-cli  EXPIRE project:1:regenerate_claim_1:stream 5
    sleep 0.1
done