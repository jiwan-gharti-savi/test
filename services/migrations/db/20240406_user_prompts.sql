UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 27;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 26;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 25;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 24;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 23;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 22;

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (55, 'claims_prompt', 'V2', 'true');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (56, 'title_prompt', 'V2', 'true');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (57, 'abstract_prompt', 'V2', 'true');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (58, 'background_description_prompt', 'V2', 'true');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (59, 'summary_prompt', 'V2', 'true');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (60, 'technical_field_prompt', 'V2', 'true');

DELETE FROM "prompt"."prompt_seq" WHERE prompt_seq_id in (458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475);

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens", "prompt_actions", "skip_append", "claim_nums", "decision_step", "step_description", "revised_step_description", "claim_component_entities", "claim_component_actions", "output_format") VALUES
(458, 1, 55, 'claims_prompt', 'system', 'Perform all the steps from Step 1 to Step 7. Generate the modified claims without #### and new line with \n.
    Step 1 - Classify the ####prompt instructions#### into the following categories: edit, delete, adjust the style or others. The instruction maybe a combination of one or more of the categories. Do not print output for this step. 
    Step 2 - If the ####prompt instructions#### is an edit instruction, identify the ####claims#### to be edited. Edit the claims in line with the ####prompt instructions####. After applying the edits, print all the claims. Do not print output for this step.
    Step 3 - If the ####prompt instructions#### is to delete, identify the ####claims#### to be deleted. Delete the claims and re-numbering the claims. Do not generate the output and move to the next step.Once the claims are deleted, identify other claims that may depend on the deleted claim. Delete those claims. re-numbering the claims and dependencies. Do not generate the output and move to the next step. Do not print output for this step.
    Step 5 - If the ####prompt instructions#### is to adjust the style of ####claims####, analyze the given template and identify the specific style elements to be applied to the claims. Apply the identified style elements to the claims, such as using lowercase letters (a, b, c) to indicate sub-claims, adjusting indentation, and modifying the language to match the template. Do not print output for this step. Review the claims to ensure that the style adjustments have been applied consistently and accurately throughout the claims.
    Step 6 - If any further style adjustments are needed based on ####prompt instructions####., repeat steps 5 until the claims fully align with the desired style. Do not print output for this step.
Step 7: If the ####prompt instructions#### are others, do exactly as per the ####prompt instructions#### taking the ####claims#### as input.  Print the modified claims in json format as follow: {"claims": "modified claims start with 1"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(459, 2, 55, 'claims_prompt', 'user', 'claims: ####{{claims}}####  prompt instructions: ####{{prompt_instructions}}####', NULL, '{"params": ["prompt_instructions"], "project": ["claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(460, 3, 55, 'claims_prompt', 'user', 'Modified Claims:', NULL, NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(461, 1, 56, 'title_prompt', 'system', 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####title#### and ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified title in json format as follow: {"title": "modified title .."}', NULL, '{"params": ["section_type"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(462, 2, 56, 'title_prompt', 'user', 'title: ####{{title}}####', NULL, '{"project": ["title"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(463, 3, 56, 'title_prompt', 'user', 'prompt_instructions: ####{{prompt_instructions}}####
Modified title:', NULL, '{"params": ["prompt_instructions"]}', '{"project": ["title"]}', NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(464, 1, 57, 'abstract_prompt', 'system', 'You are playing the role of a patent attorney trying to draft an abstract of a patent to be filed at a patent office. The only inputs you will accept from the user are ####abstract#### and ####prompt_instructions####. It is crucial that you follow the attorney instructions from ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified abstract in json format as follow: {"abstract": "modified abstract ..."}', NULL, '{"params": ["section_type"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(465, 2, 57, 'abstract_prompt', 'user', 'abstract: ####{{abstract}}####', NULL, '{"project": ["abstract"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(466, 3, 57, 'abstract_prompt', 'user', 'prompt_instructions: ####{{prompt_instructions}}####
Modified Abstract:', NULL, '{"params": ["prompt_instructions"]}', '{"project": ["abstract"]}', NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(467, 1, 58, 'background_Description_prompt', 'system', 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####background_description####and attorney instructions from  ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified background description in json format as follow: {"background_description": "modified background description ..."}', NULL, '{"params": ["modifed_section_type"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(468, 2, 58, 'background_Description_prompt', 'user', 'background_description: ####{{background_description}}####', NULL, '{"params": ["modifed_section_type"], "project": ["background_description"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(469, 3, 58, 'background_Description_prompt', 'user', 'prompt_instructions: ####{{prompt_instructions}}####
Modified background description:', NULL, '{"params": ["prompt_instructions"]}', '{"project": ["background_description"]}', NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(470, 1, 59, 'summary_prompt', 'system', 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####summary#### and ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Do not print the ####prompt_instructions#### in the output. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified summary in json format as follow: {"summary": "modified summary ..."}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(471, 2, 59, 'summary_prompt', 'user', 'summary: ####{{summary}}####', NULL, '{"project": ["summary"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(472, 3, 59, 'summary_prompt', 'user', 'prompt_instructions: ####{{prompt_instructions}}####
Modified summary:', NULL, '{"params": ["prompt_instructions"]}', '{"project": ["summary"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(473, 1, 60, 'technical_field_prompt', 'system', 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####technical_field####and attorney instructions are delimited by ####. It is crucial that you follow the attorney instructions provided and avoid using any prohibited words or phrases. Do not print the ####prompt_instructions#### in the output. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output modified technical_field in json format as follow: {"technical_field": "modified technical_field ..."}', NULL, NULL, NULL, NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json'),
(474, 2, 60, 'technical_field_prompt', 'user', 'technical field: ####{{technical_field}}####', NULL, '{"project": ["technical_field"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(475, 3, 60, 'technical_field_prompt', 'user', 'prompt_instructions: ####{{prompt_instructions}}####
Modified technical_field:', NULL, '{"params": ["prompt_instructions"]}', '{"project": ["technical_field"]}', NULL, NULL, NULL, 't', 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'json');

UPDATE "prompt"."prompt_seq" SET "is_stream" = 't', "model" = 'gpt-4-1106-preview', "output_format" = 'json' WHERE "prompt_seq_id" = 472;

UPDATE "prompt"."prompt_seq" SET "is_stream" = NULL, "model" = NULL, "output_format" = NULL WHERE "prompt_seq_id" = 473;

DELETE FROM "prompt"."prompt_seq" WHERE prompt_seq_id in (452, 455, 409);

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens", "skip_append", "prompt_actions", "output_format", "claim_nums", "decision_step", "step_description", "revised_step_description", "claim_component_entities", "claim_component_actions") VALUES
(452, 1, 54, 'total_detailed_description', 'system', 'Your aim is to eliminate only the egregious/obvious duplications of technical features/technical attributes/properties/quantities/alternatives/embodiments/examples in input ####total description####. Your aim is not to shorten/truncate/summarise the input ####total description#### but only to eliminate egregious/obvious duplicates/redundancies by doing the following: 

Step 1: (a) Identify from ####total description#### the following sections, if available (i) "explanation step .... " - anything following this title this includes explanation of flow chart, (ii) "introduction_component ..." and "explanation_component ... " - explanation following this title includes explanation of a system/block diagram and (iii) "entities explanation..." -explanation following this title includes explanation of entities
b) Please rewrite all the sections identified from text ####total description#### by including ''all'' technical features/technical attributes/properties/quantities/alternatives/embodiments/examples across (i), (ii) and (iii) by only removing/eliminating egregious duplication/egregious redundancies. Please ensure there is no change or generalisation in the technical language, quantities, properties, alternatives, embodiments and logical flow in the rewrite of ####total description####.   
c) In the re-write of the ####total Description####, ensure that all references to step numbers in flow chart explanation under section  (i) like 100, 200 etc.,  or references to component numbers in explanation under section (ii) that explain a block diagram are kept/maintained. Similarly, the rewrite must keep/maintain all  the references to entity identifiers like display (10,40) that identify an entity uniquely. Do not use the titles like explanation step ..., introduction_component/explanation_component or introduction component number etc. in the rewrite of ####total description####.

Step 1.1: a) Do not truncate/shorten/summarize the input ####total description####. Ensure the rewrite includes all details in all the sections across (i), (ii) and (iii) identified from text ####total description####. Ensure the rewrite includes ''all'' technical features/technical attributes/properties/quantities/alternatives/embodiments/examples across sections (i), (ii) and (iii) and only avoids/eliminates  egregious duplication/egregious redundancies. Please ensure there is no change or generalisation in the technical language, quantities, properties, alternatives, embodiments and logical flow in the rewrite of ####total description####.   
c) In the re-write of the ####total Description####, ensure that all references to step numbers in flow chart explanation under section  (i) like 100, 200 etc.,  or references to component numbers in explanation under section (ii) that explain a block diagram are kept/maintained. Similarly, the rewrite must keep/maintain all  the references to entity identifiers like display (10,40) that identify an entity uniquely. Do not use the titles like explanation step ..., introduction_component/explanation_component or introduction component number etc. in the rewrite of ####total description####.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(455, 4, 54, 'total_detailed_description', 'system', 'Step 1: Your aim is to revise the text ####deduplicated_description#### to remove profanity words as defined below, in context of writing a patent specification, without changing any of the technical language/technical vocabulary used in the text ####deduplicated_description#### by following these guidelines:

(a)	Quote/cite the entire text ####deduplicated_description#### without altering/generalizing/summarising/changing the technical language for any of the numerical attributes/properties such as taste, texture etc.,  or without changing language of embodiments/examples, specific quantities, technical details/parameters/definitions, uses etc.  
(b)	When quoting/citing the entire text ####deduplicated_description####, remove use of all adjectives or superlatives that describe the entities or their actions 
(c)	Exclude use of patent profanity terms such as "step", "sub-step", "claim_step_actions", "current Invention", "patent", "entity", "action", "entities", "alternative of each entity", "implicit component", "specific_attributes", "attributes_rewritten", "missing attributes" "technical write-up" and "entity action", "real-world", "Entity_claims", "Claims", "Claim number", "Entity_claim", "Entity number from claims", etc. and avoid using superlatives like "critical", "most important", "crucial", "important", "essential", "necessary", "non-critical", "non-essential", "Superior" in the rewrite
(d)	Do not include the headers i.e "==Introduction_Component … ==", ==explanation_component ….== etc. in the revision
(e)	Ensure the revised description does not remove the step numbers like 100, 200 etc. or component numbers like 500, 502 or entity identifiers like (10,40) etc if used in input text ####deduplicated_description####
', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

(409, 1, 53, 'extra_description', 'system', 'I am giving you the following inputs to write a detailed explanation for the component and its sub-components:
1. ####Claims####
2. ####Current invention####
3. components_entitiesin json format
4. entity_attributes_rewritten in json format

Step 1: Choose the component number {{component_num}} from json components_entities for the explanation. 
The explanation should be written by following the instructions in a, b and c below:

a) Define and explain all the entities for the chosen component number from field Re-grouped Entities from json components_entities. For the definition, Co-relate the entities from field Re-grouped Entities from json components_entities with the entities from field entities_claim and from field entities_inv from json entity_attributes_rewritten to identify all their cited attributes. After making the co-relation do the following: Quote/cite all the attributes for all the co-related entities, without changing the technical details/language, from json  entity_attributes_rewritten from field 1) specific_attributes_claims and 2) from field all invention attributes and 3) from field additional_attributes_invention. Once the attributed are cited and quoted,  explain how they contribute to the invention from text ####Claims#### and text ####Current invention####. Avoid use of quotations in the explanation.

Do not refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Just quote facts from the inputs provided and avoid use of adjectives in the explanation. Avoid use of quotations in the explanation.
Output format: ==entities explanation {{component_num}}===

Step 2: Re-run step 1 till 
a) Quote/cite all the attributes for all the entities, without changing the technical details/language, from json entity_attributes_rewritten from field 1) specific_attributes_claims and 2) from field all invention attributes and 3) from field additional_attributes_invention.
b) No claim numbers should be referenced from field claim_number from json ####entity_actions_rewritten#### in the explanation
c) Do not use words like "entity", "entities", "entity action", "crucial", "critical" etc in the explanation
', NULL, '{"project": ["flowchart_main_element_nums"]}', NULL, NULL, NULL, 'Start', NULL, 'gpt-4-1106-preview', NULL, 4096, NULL, NULL, 'text', NULL, NULL, NULL, NULL, NULL, NULL);

UPDATE "prompt"."prompt_seq" SET "model"='gpt-4-1106-preview', "multicalls"=TRUE WHERE "prompt_seq_id"=455;

UPDATE "prompt"."prompt_seq" SET "instructions"='Deduplicated_Description: {{deduplication_description}}' WHERE "prompt_seq_id"=456;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'I am giving you the following inputs to write a detailed explanation for the component and its sub-components:
1. ####Claims####
2. ####Current invention####
3. components_entities in json format
4. entity_attributes_rewritten in json format

Step 1: Choose the component number {{component_num}} from json components_entities for the explanation. 
The explanation should be written by following the instructions in a, b and c below:

a) Define and explain all the entities for the chosen component number from field Re-grouped Entities from json components_entities. For the definition, Co-relate the entities from field Re-grouped Entities from json components_entities with the entities from field entities_claim and from field entities_inv from json entity_attributes_rewritten to identify all their cited attributes. After making the co-relation do the following: Quote/cite all the attributes for all the co-related entities, without changing the technical details/language, from json  entity_attributes_rewritten from field 1) specific_attributes_claims and 2) from field all invention attributes and 3) from field additional_attributes_invention. Once the attributed are cited and quoted,  explain how they contribute to the invention from text ####Claims#### and text ####Current invention####. Avoid use of quotations in the explanation.

Do not refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Just quote facts from the inputs provided and avoid use of adjectives in the explanation. Avoid use of quotations in the explanation.
Output format: ==entities explanation {{component_num}}===

Step 2: Re-run step 1 till 
a) Quote/cite all the attributes for all the entities, without changing the technical details/language, from json entity_attributes_rewritten from field 1) specific_attributes_claims and 2) from field all invention attributes and 3) from field additional_attributes_invention.
b) No claim numbers should be referenced from field claim_number from json ####entity_actions_rewritten#### in the explanation
c) Do not use words like "entity", "entities", "entity action", "crucial", "critical" etc in the explanation
' WHERE "prompt_seq_id" = 409;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Perform all the steps from Step 1 to Step 7. Generate the modified claims without #### and new line with \n.
    Step 1 - Classify the ####prompt instructions#### into the following categories: edit, delete, adjust the style or others. The instruction maybe a combination of one or more of the categories. Do not print output for this step. 
    Step 2 - If the ####prompt instructions#### is an edit instruction, identify the ####claims#### to be edited. Edit the claims in line with the ####prompt instructions####. After applying the edits, print all the claims. Do not print output for this step.
    Step 3 - If the ####prompt instructions#### is to delete, identify the ####claims#### to be deleted. Delete the claims and re-numbering the claims. Do not generate the output and move to the next step.Once the claims are deleted, identify other claims that may depend on the deleted claim. Delete those claims. re-numbering the claims and dependencies. Do not generate the output and move to the next step. Do not print output for this step.
    Step 5 - If the ####prompt instructions#### is to adjust the style of ####claims####, analyze the given template and identify the specific style elements to be applied to the claims. Apply the identified style elements to the claims, such as using lowercase letters (a, b, c) to indicate sub-claims, adjusting indentation, and modifying the language to match the template. Do not print output for this step. Review the claims to ensure that the style adjustments have been applied consistently and accurately throughout the claims.
    Step 6 - If any further style adjustments are needed based on ####prompt instructions####., repeat steps 5 until the claims fully align with the desired style. Do not print output for this step.
Step 7: If the ####prompt instructions#### are others , do exactly as per the ####prompt instructions#### taking the ####claims####  or ####invention#### as input.  Print the modified claims in json format as follows: {"claims": "modified claims start with 1"}' WHERE "prompt_seq_id" = 458;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'claims: ####{{claims}}####  invention: ####{{invention}}#### prompt instructions: ####{{prompt_instructions}}####', "inputs" = '{"params": ["prompt_instructions"], "project": ["claims","invention"]}' WHERE "prompt_seq_id" = 459;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####title#### and ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified title in json format as follows: {"title": "modified title .."}' WHERE "prompt_seq_id" = 461;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'You are playing the role of a patent attorney trying to draft an abstract of a patent to be filed at a patent office. The only inputs you will accept from the user are ####abstract#### and ####prompt_instructions####. It is crucial that you follow the attorney instructions from ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified abstract in json format as follows: {"abstract": "modified abstract ..."}' WHERE "prompt_seq_id" = 464;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####background_description####and attorney instructions from  ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified background description in json format as follows: {"background_description": "modified background description ..."}' WHERE "prompt_seq_id" = 467;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####summary#### and ####prompt_instructions####. It is crucial that you follow the ####prompt_instructions#### provided and avoid using any prohibited words or phrases. Do not print the ####prompt_instructions#### in the output. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output the modified summary in json format as follows: {"summary": "modified summary ..."}' WHERE "prompt_seq_id" = 470;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'You are playing the role of a technical assistant. The only inputs you will accept from the user are ####technical_field####and attorney instructions are delimited by ####. It is crucial that you follow the attorney instructions provided and avoid using any prohibited words or phrases. Do not print the ####prompt_instructions#### in the output. Please give more importance to ####prompt_instructions#### and do not repeat them in the output. Thank you for your attention to detail and adherence to the guidelines.  Output modified technical_field in json format as follows: {"technical_field": "modified technical_field ..."}' WHERE "prompt_seq_id" = 473;