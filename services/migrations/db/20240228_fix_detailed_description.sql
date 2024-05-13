UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 34;

-- INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (38, 'block_diagram_description', 'V4', 'true');

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 19;

-- INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (39, 'block_diagram_common', 'V3', 'true');

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 16;

-- INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (40, 'flowchart_common', 'V3', 'true');

DELETE FROM prompt.prompt_seq where prompt_seq_id in (295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316);

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens") VALUES
(295, 1, 39, 'block_diagram_common', 'system', 'I have provided you with the text ####Claims####. Using the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(296, 2, 39, 'block_diagram_common', 'user', 'Claims: ####{{claims}}#### ', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(297, 3, 39, 'block_diagram_common', 'user', 'step 3', NULL, NULL, '{"project": ["check_is_diagram_available"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(298, 5, 39, 'block_diagram_common', 'user', 'I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

I have also provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step a table format whose table name is ==component_sub-component== with 5 columns having the following headings: Component type - system/component/sub-component, system/component/sub-component name,  system/component/sub-component name, explanation, claim number
 current invention: ####{{invention}}####
entity_actions_rewritten: ####{{entity_actions_rewritten}}####
entity_generalized_rewritten: ####{{entity_generalized_rewritten}}####

Step 5', NULL, '{"project": ["invention", "entity_actions_rewritten", "entity_generalized_rewritten"]}', '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(299, 6, 39, 'block_diagram_common', 'user', 'step 5.1', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(300, 7, 39, 'block_diagram_common', 'user', 'step 5.2', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(301, 8, 39, 'block_diagram_common', 'user', 'step 5.3', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(302, 9, 39, 'block_diagram_common', 'user', 'step 5.4 and step 5.5', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(303, 10, 39, 'block_diagram_common', 'user', 'step 5.6', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(304, 11, 39, 'block_diagram_common', 'user', 'step 5.7', NULL, NULL, '{"project": ["block_diagram_common"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(305, 12, 38, 'block_diagram_description', 'user', 'System and all main components from {component_sub-component}', '{
    "name": "generate_all_component_nums",
    "parameters": {
        "type": "object",
        "properties": {
            "component_nums": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "component_num": {
                            "type": "number"
                        }
                    }
                },
                "description": "generate System and all Component number without Sub-components. Ex: 200, 202"
            }
        }
    }
}', NULL, '{"project": ["component_nums"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(306, 13, 38, 'block_diagram_description', 'user', 'Step 12: Our goal is to Co-relate all the specific entity actions associated with ####current invention#### in all the claims from text ####entity_actions_rewritten #### with all the components from Step 5.7. Ensure all entity actions from text ####entity_actions_rewritten#### are co-related with all the components from {component_sub-component} and all the components numbers are mentioned in the output. For every entity action, also extract the mathematical construct or parameters or metrics/measurements associated with it from text ####current invention####. For all entity actions from text ####entity_actions_rewritten #### also extract all the definitions/explanations of every technical term in the entity action from text ####current invention####. Output - Claim 1:- entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, all entity action details/definitions/parameters, entities, components etc. Claim 2 : entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, entity action entity action 1, all entity action details/definitions/parameters, entities, components etc and so on for every claim.

Step 13: Ensure all the components from Step 5.8  are referenced in the output from Step 12. Do not ignore any component from from Step 5.8 in the output from Step 12. Do not repeat the step instructions in the output.', NULL, NULL, '{"project": ["claim_step_actions"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(307, 14, 38, 'block_diagram_description', 'system', 'I am giving you the following inputs to write a detailed explanation for:
1. ####Claims####
2. co-relation between entities from ####current invention#### and the various components-sub components in ####components_entities#### that when working together enable the system to function
3. Mapping between all the claims, entity actions and the components from ####claims_component_action####

Step 1: Choose the {{component_num}} component and its sub-components from ####components_entities####.  The explanation should be structured as follows, with each section addressing the specific points mentioned:
==Introduction_{{component_num}}==
a) Briefly introduce the component and its significance in the context of its application.
==Component_and_sub-component_overview_{{component_num}}== 
b) Provide a Component and sub-component Overview (Referencing ####components_entities#### ) where you need to reference, define, and explain all the entities that comprise this component and sub-component, focusing on their characteristics, roles, and how they contribute to the component''s function.

Number all the components and sub-components from ####components_entities#### in the explanation. Do not refer to the words like "entity", "entities", "claim", "crucial" etc. in the explanation. Write the output of ==Introduction_{{component_num}}==, ==Component_and_sub-component_overview_{{component_num}}== in 50 words', NULL, '{"project": ["flowchart_main_element_nums"]}', NULL, NULL, NULL, 'Start', NULL, 'gpt-4-1106-preview', NULL, 4096),
(308, 15, 38, 'block_diagram_description', 'user', 'Current Invention:
####{{invention}}####

Claims:
####{{claims}}#### 
components_entities:
####{{element_explanations}}####

claim_step_actions:
####{{claim_step_actions}}###', NULL, '{"project": ["invention", "claims", "element_explanations", "claim_step_actions"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', 't', 4096),
(309, 16, 38, 'block_diagram_description', 'user', 'Explain the Working of the chosen {{component_num}} component and it''s sub-component above Referencing ####claims_component_action####. Ensure that the working/entity actions of the component and sub-component is structured coherently, with each entity action explanation flowing logically into the next. The language should be technical yet clear, catering to a professional audience with the aim of providing a thorough understanding of the component''s workings. :
(a) Reference, define and describe in detail all the entity actions associated with all the entities of the chosen component and its sub-components, as mapped in ####claims_component_action#### so that a technical person can understand without making any assumptions.  (do not refer to the entity action explicitly) 
(b) For each entity action, explain its nature (what), purpose (why), context (when and under what conditions), and method (how). 
(c) Use your knowledge base to include any implicit entities, components, actions, or details not explicitly mentioned in ####claims_component_action#### but crucial for a complete understanding of all the entity actions and how they flow logically into one another for the working of the system. 

Number the components and sub-components from ####components_entities#### in the explanation. Do not number entities or refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Do not repeat anything from the explanation that explains the entities comprising the component and sub-component from above.  ==explanation_{{component_num}}==  Write the output of ==explanation_{{component_num}}==  in 200 words', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', NULL, 4096),
(310, 17, 38, 'block_diagram_description', 'user', 'Combine the Introduction_{{component_num}}, Component_and_sub-component_overview_{{component_num}} and explanation_{{component_num}} of component {{component_num}}.   Our goal is only to state facts about the component/sub-component and it''s working, it''s real world manifestation and not use any adjectives/language that deviates from that goal. To achieve this goal: Rewrite (a) by removing the adjectives/superlatives for all the entities and their actions. Remove patent profanity terms  like "invention", "entity", "entities", "alternative of each entity", "laymen", "implicit component", "technical write-up" and "entity action", "real-world" etc. (b) Also, remove superlatives like "critical", "most important", "crucial", "important"etc. (c) Do not use titles like "Introduction" and "component and sub-component overview" etc. in the output. (d) Write the output in a multiple paragraphs without removing reference numbers for all components/entities from the input.', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": ["flowchart_description"]}', NULL, NULL, 'End', 't', 'gpt-4-1106-preview', NULL, 4096),
(311, 1, 40, 'flowchart_common', 'system', 'I have provided you with the text ####Claims####.  Step 3: Use the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a method claim. Output format: @@@Yes-method-claim@@@.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(312, 2, 40, 'flowchart_common', 'user', 'Claims: ####{{claims}}####', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(313, 3, 40, 'flowchart_common', 'user', 'step 3', NULL, NULL, '{"project": ["check_is_diagram_available"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(314, 5, 40, 'flowchart_common', 'user', 'I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

current invention: ####{{invention}}####
entity_actions_rewritten: ####{{entity_actions_rewritten}}####


Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc.

Step 5
', NULL, '{"project": ["invention", "entity_actions_rewritten"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(315, 6, 40, 'flowchart_common', 'user', 'step 5.1', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(316, 7, 40, 'flowchart_common', 'user', 'step 6', NULL, NULL, '{"project": ["flowchart_common"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096);