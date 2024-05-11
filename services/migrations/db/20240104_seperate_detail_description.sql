
ALTER TABLE "prompt"."prompt"
ADD COLUMN "model" varchar
(128);

ALTER TABLE "prompt"."prompt_seq"
ADD COLUMN "model" varchar
(128);

ALTER TABLE "prompt"."prompt_seq"
ADD COLUMN "multicalls" bool;

ALTER TABLE "project"."figures_section_history"
ADD COLUMN "references_explanation" text;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 18;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 31;

INSERT INTO "prompt"."prompt"
    ("prompt_id", "name", "version", "is_selected")
VALUES
    (33, 'flowchart_description', 'V3', 't');

INSERT INTO "prompt"."prompt"
    ("prompt_id", "name", "version", "is_selected", "parent_prompt_id", "created_at", "modified_at", "model")
VALUES
    (34, 'block_diagram_description', 'V3', 't', NULL, NULL, NULL, NULL),
    (35, 'block_diagram_description_with_figures', 'V2', 't', NULL, NULL, NULL, NULL);
ALTER TABLE "project"."figures_section_history"
ADD COLUMN "claim_step_actions" text;

DELETE FROM prompt.prompt_seq where prompt_seq_id in (137,138,139,140,141,142,143,260,261,262,263,264,265);
DELETE FROM prompt.prompt_seq where prompt_seq_id in (266,267,268,269,270,271,272,273,274,276,277,278,279);
DELETE FROM prompt.prompt_seq where prompt_seq_id in (176,177,178,179,180,181,182,183,184,185,186);

INSERT INTO "prompt"."prompt_seq"
    ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls")
VALUES
    (176, 1, 19, 'block_diagram_common', 'system', 'I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a system/apparatus/device/machine claim, then perform steps 5 to 7.

Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process), do not do anything.

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output format:- Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each step, as follows - if the system is 200, the component number is 202 - it''s sub-component number will be 202-a, 202-b, for  component 204 the sub-component will be 204-a, 204-b etc. Print the output of this step in the following format: ==component_sub-component==200 -> explanation -> claim number, 200-a -> explanation -> claim number, etc. ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (177, 2, 19, 'block_diagram_common', 'user', 'Current Invention: ####{{invention}}#### \n\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \n\n entity_generalized_rewritten: ####{{entity_generalized_rewritten}}#### \n\n Claims: ####{{claims}}#### alternatives for each entity ####{{alternative_entity_name}}####', NULL, '{"project": ["invention", "entity_actions_rewritten", "entity_actions_rewritten", "alternative_entity_name", "claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (178, 3, 19, 'block_diagram_common', 'user', 'step 3', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (179, 4, 19, 'block_diagram_common', 'user', 'step 4', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (180, 5, 19, 'block_diagram_common', 'user', 'step 5', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (181, 6, 19, 'block_diagram_common', 'user', 'step 5.1', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (182, 7, 19, 'block_diagram_common', 'user', 'step 5.2', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (183, 8, 19, 'block_diagram_common', 'user', 'step 5.3', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (184, 9, 19, 'block_diagram_common', 'user', 'step 5.4 and step 5.5', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (185, 10, 19, 'block_diagram_common', 'user', 'step 5.6', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (186, 11, 19, 'block_diagram_common', 'user', 'step 5.7', NULL, NULL, '{"project": ["block_diagram_common"]}', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO "prompt"."prompt_seq"
    ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls")
VALUES
    (137, 1, 16, 'flowchart_common', 'system', 'I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####Entity action####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then perform steps 4 to 9.

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc. 

Step 7: Identify the decision making step from the output of step 6.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (138, 2, 16, 'flowchart_common', 'user', 'Current Invention: ####{{invention}}#### \n\n entity_generalized_rewritten: ####{{entity_generalized_rewritten}}#### \n\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \n\n Claims: ####{{claims}}#### alternatives for each entity ####{{alternative_entity_name}}####', NULL, '{"project": ["invention", "entity_generalized_rewritten", "entity_actions_rewritten", "alternative_entity_name", "claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (139, 3, 16, 'flowchart_common', 'user', 'step 3', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (140, 4, 16, 'flowchart_common', 'user', 'step 4:', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (141, 5, 16, 'flowchart_common', 'user', 'step 5', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (142, 6, 16, 'flowchart_common', 'user', 'step 5.1', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL),
    (143, 7, 16, 'flowchart_common', 'user', 'step 6', NULL, NULL, '{"project": ["flowchart_common"]}', NULL, NULL, NULL, NULL, NULL, NULL);

-- INSERT INTO "prompt"."prompt_seq"
--     ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls")
-- VALUES
--     (176, 1, 19, 'block_diagram_common', 'system', 'I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####
--
-- I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc.
--
-- Step 3: If the text ####Claims#### include a system/apparatus/device/machine claim, then perform steps 5 to 7.
--
-- Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process), do not do anything.
--
-- Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.
--
-- step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc.
--
-- Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.
--
-- Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities
--
-- Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output format:- Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc.
--
-- Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4.
--
--
-- Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5
--
-- Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each step, as follows - if the system is 200, the component number is 202 - it''s sub-component number will be 202-a, 202-b, for  component 204 the sub-component will be 204-a, 204-b etc. Print the output of this step in the following format: ==component_sub-component==200 -> explanation -> claim number, 200-a -> explanation -> claim number, etc. ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


DELETE FROM prompt.prompt_seq WHERE prompt_seq_id in (213, 214, 215, 216, 217, 240);

INSERT INTO "prompt"."prompt_seq"
    ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls")
VALUES
    (213, 1, 28, 'claims', 'system', 'I will provide you ####current invention####. Please write the claims for the current invention according to the instructions given below:

Step 1: Identify all the entities from the text  ####current invention####. Print the output of this step in the following format: ==entities== Entity 1; Entity 2 etc. 

Step 2: Identify all the specific numerical attributes, specific properties (including physical properties such as state, texture, etc. and particular examples), specific quantities from text ####current invention#### associated with each/every entity from {entities} . Use this format for output: ==specific_attributes== Entity 1 from {entities} -> Specific Attributes; Entity 2 from {entities}-> Specific Attributes etc.

Step 3: Identify all the entities from {entities} where (a) the sequence or order is associated with the entity and (b) where that sequence is important in context of ####current invention####. Output: ==entities_with_sequence==. 
Examples of words that mention sequence or order of entities are words like first, second etc. 

Step 3.1: Identify only the entities from {entities} where the sequence or order does not matter in context of ####current invention####. Ensure entities from ==entities_with_sequence== is not repeated here. Output: ==entities_without_sequence==

Step 4: Generalise the language for all the entities that are specific from {entities_without_sequence} in context of text ####current invention####. Ensure the generalised language while broadening the scope of the action of {entities_without_sequence} is not vague and retains the technical essence of the entities in context of ####current invention####. Ensure the generalised language for entities from {entities_without_sequence} allows one to distinguish one entity from the other. Use this format for Output: ==entity_generalised== Entity 1 from {entities_without_sequence} -> generalisation needed yes/no -> generalised language for Entity 1 if yes; Entity 2 from {entities_without_sequence}-> generalisation needed yes/no -> generalised Entity 2 etc.,

Step 4.1: Do not generalise the language of all the entities mentioning a sequence from {entities_with_sequence}. Use this format for Output: ==entity_generalised_sequence== Entity 1 from {entities_with_sequence} -> generalisation needed yes/no -> generalised language with sequence information for Entity 1 , Entity 2 from {entities_with_sequence} -> generalisation needed yes/no -> generalised language for Entity 2 with sequence information etc. 

Step 4.2: co-relate/Clearly associate each entity from {entities} with the corresponding generalised entity form {entity_generalised} or  {entity_generalised_sequence} and its respective specific attributes from {specific_attributes}. For each entity from {entities}, first list its specific attributes from {specific_attributes}, followed by its generalised form from {entity_generalised} or {entity_generalised_sequence}. This format will help to maintain the technical essence of each entity while ensuring that all the details from {specific_attributes} are included accurately and the language remains non-generalised. Use this format for output:
==entity_attributes==
Entity 1 from {entities} ->
Specific Attributes: {attribute1}, {attribute2}, ... from {specific_attributes};
Generalised Form: generalised Entity 1 from {entity_generalised} or from {entity_generalised_sequence};
Entity 2 from {entities} ->
Specific Attributes: {attribute1}, {attribute2}, ... from {specific_attributes};
Generalised Form: generalised Entity 1 from {entity_generalised} or from {entity_generalised_sequence}; etc

Step 5: Identify all the direct and indirect entity actions of all the entities from {entities} using text ####current invention####. Generalise the language for all entity actions from text ####current invention####. Ensure the generalised language while broadening the scope of action retains the technical essence in context of ####current invention#### and is not vague. Use specifics for the entity actions from text ####current invention#### where necessary to avoid being vague. Use this format for output: ==entity_generalised_actions== Entity 1 from {entities}-> Entity 1 Action 1 -> generalised language for Entity 1 Action; Entity 1 from {entities} -> Entity 1 Action 2 -> generalised language for Entity Action 2, Entity 2 from {entities} -> Entity 2 Action 1 -> generalised language for Entity 2 Action 1 etc. 

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (214, 2, 28, 'claims', 'user', 'current invention: ####{{invention}}####', '{
    "name": "extract_intermediate_results",
    "parameters": {
        "type": "object",
        "properties": {
            "entities": {
                "type": "string",
                "description": "Entities from Step 1"
            },
            "specific_attributes": {
                "type": "string",
                "description": "specific attributes for the entities from Step 2"
            },
            "entities_with_sequence": {
                "type": "string",
                "description": "entities with sequence from Step 3"
            },
            "entities_without_sequence":{
                "type": "string",
                "description": "entities without sequence from Step 3.1"
            },
            "entity_generalised": {
                "type": "string",
                "description": "Generalized Entities without sequence from Step 4 "            },
            "entity_generalised_sequence": {
                "type": "string",
                "description": "Generalised entities with sequence preserved from Step 4.1."                
            },
            "entity_attributes": {
                "type": "string",
                "description": "entity attributes from Step 4.2."                
            },
            "entity_generalised_actions": {
                "type": "string",
                "description": "Entity Actions from Step 5"
            },
            "novelty": {
                "type": "string",
                "description": "Novelty from Step 6"
            },
            "necessary_features": {
                "type": "string",
                "description": "Necessary features details from Step 6"
            },
            "optional_features": {
                "type": "string",
                "description": "Optional features from Step 6"
            }
                        
        },
        "required": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes", "entity_generalised_actions",
"novelty", "necessary_features", "optional_features"]
    },
    "description": "Get all intermediate results of the Claims for Step 1 to Step 6"
}', '{"project": ["invention"]}', '{"project": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes", "entity_generalised_actions", "novelty", "necessary_features", "optional_features"]}', NULL, NULL, NULL, NULL, NULL, NULL),
    (215, 3, 28, 'claims', 'user', 'Step 9: You are a patent attorney. Your aim is to draft patent claims for text ####current invention#### by following Steps 10 to 29. When drafting claims, use the generalised language for all entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for entity actions from {entity_generalised_actions} without being vague. When writing a claim it is important to describe how the various entities are structured and how the various entities interact and connect.

Step 10: Draft independent claims for a method/system/ process/ apparatus/machine/device/product/composition etc. in context of novelty {novelty} using only the necessary features from {necessary_features}. Use the generalised language for entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for entity actions from {entity_generalised_actions} to write all the independent claims without being vague. 

Step 11: Draft additional independent claims for larger systems, using only the necessary features from {necessary_features} that encompass the invention to enhance damages in litigation. Use the generalised language for entities from {entity_generalised} or {entity_generalised_sequence} and generalised entity actions from {entity_generalised_actions} to write all the independent claims without being vague. 

Step 12: Ensure all the independent claims are truly independent and not dependent on other claims. It is not allowed for Independent claims to reference any other claims. 

Step 13: For defining the borders of the invention with detailing and specificity, there can be the addition of dependent claims. The dependent claims must specify all the {specific_attributes} and specific entity forms/names for all generalised entities from {entity_generalised} or {entity_generalised_sequence} referenced in the independent claims using {entity_attributes}. {entity_attributes} stores the mapping between generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective attributes from {specific_attributes} and specific entity form/name from {entities}. The dependent claims should not repeat/recite entity attributes/features already mentioned in the independent claims. 

Step 14: Write additional dependent claims using the additional features/actions of entities from {optional_features} and not covered in independent claims. 

Step 16: Ensure, the dependent claims reference the relevant independent claim on which it is dependent. Ensure, dependent claims reference only one independent claim on which it is dependent. Referencing more than one independent claim is not allowed. It is preferred that the dependent claims reference only the independent claims. Referencing other dependent claims is not preferred.   

Step 17: Aim for 20 total claims, with 3 being independent, to avoid additional fees.

Step 18: Avoid "means for" or "steps" in all claims to prevent invoking par. 112 issues.

Step 19:  Replace terms like "mechanism", "element", or "member" with terms conveying specific functions such as "coupler", "support", or "detector."

Step 20: Provide antecedent basis for entities used in all the claims and introduce features properly before reciting their functionality. Every entity or noun in the claim, when introduced, should be introduced by an article usually "a" or "an" and not article "the", except when introduced as a plurality or as "means".  When introducing plurality, avoid the use of article "the". Every subsequent reference to a previously introduced entity should be prefaced "the" or "said" (some practitioners use "said" to refer to entities, and "the" for other features). Adjectives may be dropped in subsequent references of entities only if the reference to the entity is unambiguous: "supporting member" can be later referenced as "said member", but if the invention also includes an "oscillating member", subsequent references should be "said supporting member" and "said oscillating member". Importantly, do not add limiting adjectives in subsequent references as given in the example ("said horizontally supporting member"). A claim may rely on itself for antecedent basis (e.g.: "a handle connected to the gear, the handle being axially aligned with the support member")

Step 21:  In claims with multiple options, use "or" instead of "and" for clarity and proper scope. 

Step 22:  Limit method claims to entity actions, not structures, and ensure dependent method claims are based on entity actions. Ensure the method claims are not vague. 

Step 23: If entity actions from {entity_generalised_actions} recites quantities, use numerical approximation or a wider numerical range to convey the quantities in claims to broaden claim scope without being vague. 

Eg: Avoid stating quantity of a polymer as a “specific percentage of a polymer” as it is vague. 
Eg: Avoid stating the property of an entity by stating “possesses a certain degree of that property” as it is vague

Step 24: Avoid subjective language or language lacking measurable quantities in all the claims. Use inputs from {entity_attributes} to avoid subjective language or language lacking measurable quantities.  

Step 25:  Specify forces or quantities exerted on particular elements for clarity. Use inputs from {entity_attributes} to specify forces or quantities. 

Step 26: Remove redundant or unnecessary dependent claims. 

Step 27:  Review and edit claims for proper punctuation and formatting

Step 28: Group all the claims in the proper order. Order all claims that depend on an independent claim before the next independent claim. 

Step 29: Avoid patent profanities such as:
29.1 Do not use words such as "Preferably" or "Such As": These words imply that the element of the claim that follows isn''t essential, and this could be interpreted to mean that it could be left out altogether. This may make it easier for a competitor to avoid infringement.
29.2 Do not use words such as "Necessary" or "Important": This could imply that without this element, the invention would not work. This could limit the claim to only those situations where that element is present.
29.3 Do not use "And/Or": This phrase can create ambiguity because it''s not clear whether it means "and", "or", or both.
29.4 Do Not use the word "About": This word can create uncertainty because it''s not clear how much variation is allowed.
29.5 Do not use "consists" of or "consisting of" and use "comprises" or "comprising" instead. The word "comprises" is often interpreted to mean "includes but is not limited to", and it generally does not limit the scope of a claim to the elements listed.  In contrast, "consists" or "consisting of" is more limiting and typically restricts the claim to the elements listed.
29.6 Do not use words such as: "absolute", "such as", "all", "each", "every ", "always" "never", "same", "identical", "exact", "minimum", "maximum", "no other", "only", "important", "critical", "essential", "required", "must", "Necessary"
29.7 Avoid words that are too vague and too exact:  "could", "might", "large", "small", "heavy", "above", "below", "right", "left", "superior", "inferior", "unique" etc.,
29.8    Avoid negative limitations, for example avoid using "without" and "not"
29.9  When describing a  quantity or number etc. try to add: "substantially" or "approximately", "about"
29.10 Avoid use of words like: "having", "including", "characterizing", "adapted to" or "adapted for" or "capable of"
29.11 Avoid annotations in claims to indicate a sequential order of steps. Do not annotate steps in a claim with language like "Step 1", "Step 2" etc. or "a", "b", "c" etc. Order of steps should not be specified to indicate a sequence of steps. 
29.12 In cases where multiple options are available, avoid the use of "or" or "and" between the options. Instead, qualify the options with "at least one a or b or c" or "one or more of a or b or c".
', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (216, 4, 28, 'claims', 'user', 'Step 30: Provide at least 2 independent claims, following steps from Step 10 to Step 29.  

Step 31: Ensure all the the independent claims from Step 30 use the generalised language for all entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for all entity actions from {entity_generalised_actions}.

Step 32: Ensure all the independent claims from the output of Step 30 are truly independent and not dependent on other claims. It is not allowed for Independent claims to reference any other claims. Draft independent claims using only necessary features from {necessary_features}. 

Step 35: Ensure that the claims from Step 30 do not contain phrases like "....independent claim....". Do not print output for this step.

Step 37: Use the formatting style of following ####sample claim#### as the format of the independent claims from step 30 (In all the independent claims one element is below the other element and avoid spacing between the elements of that claim). Ensure all elements of the independent claim start with small cap letter. Print the formatted claims. Do not print the step number

Sample claim:
####{{claim_template}}####

Independent Claims:', '{
    "name": "generate_independent_claims",
    "description": "generate all independent claims. Each independent claim ends with double new lines",
    "parameters": {
        "type": "object",
        "properties": {
            "independent_claims": {
                "type": "string"
            },
            "total_independent_claims":{
                "type": "number"
            }
        },
        "required": ["independent_claims", "total_independent_claims"]
    }
}', '{"template": ["claim_template"]}', '{"project": ["independent_claims"]}', NULL, NULL, NULL, NULL, NULL, NULL),
    (217, 5, 28, 'claims', 'user', 'Step 40: Write all the dependent claims, following steps from Step 10 to Step 29 such that the total number of independent claims from {independent_claims} and dependent claims is 20. Do not print output for this step. Ensure all the dependent claims reference the respective independent claims only. Referencing other dependent claims is not preferred. 

Step 43: Using inputs from {entity_attributes},  ensure the dependent claims from Step 40 specify all the specific entities and all their corresponding specific attributes referenced in the respective independent claims on which they are dependent. The dependent claims must not repeat {entity_attributes}  already mentioned in the independent claims. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 43.1: Write additional dependent claims from Step 40 to distinctly relate to the respective independent claim on which it is dependent by specifying the generalised entity and its attributes from {entity_attributes} not covered from Step 43. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 44: Add additional dependent claims from Step 40 by specifying all the optional features from {optional_features} in the dependent claims. Ensure that the dependent claim cites the optional features from {optional_features} and cites all the associated specific attributes of all the {optional_features} using the specific name/form of entities from {entity_attributes} when writing the claim. Do not print output for this step.   Step 44.1: Once all the {optional_features} and {entity_attributes}are covered in the claims from Step 40, add additional dependent claims from by specifying features using your own knowledge base in context of the {entity_generalised_actions} and {novelty} to broaden the scope of the invention from ####current invention####. 

Step 45: Ensure none of the dependent claims from Step 40 repeat any entity action from {entity_generalised_actions} or any entity attributes/properties/quantities from {entity_attributes} mentioned in the independent claims from {independent_claims} or in other dependent claims. Do not print output for this step. 

Step 46: Ensure, all the dependent claims from Step 40 reference only the independent claim on which it is dependent. Referencing other dependent claims is not preferred. Referencing more than one independent claim is not allowed. Do not print output for this step. 

Step 47: Ensure that the dependent claims from Step 40 do not contain phrases like  ".....dependent claim.....". Do not print output for this step. 

Step 48: Ensure that the step 40 generates adequate number of dependent claims such that the total number of independent claims and dependent claims for the invention is 20. Include all the independent claims from {independent_claims} in the 20 claims. Do not print output for this step.                                          ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (240, 6, 28, 'claims', 'user', 'Step 49: Print all the 20 claims which includes independent claims from {independent_claims} and dependent claims from output of Step 40 in the proper order by following the steps given: (a) Print any one independent claim from {independent_claims} first followed by all the dependent claims from Step 40 that depend on it before printing the next independent claim (b) Order all the dependent claims the same independent claim under it (c) Number the claims in the descending order. Claims:
', '{
    "name": "generate_claims",
    "parameters": {
        "type": "object",
        "properties": {
            "claims": {
                "type": "string",
                "description": "Claims in the proper order from Step 49."
            },
            "total_claims":{
                "type": "number"
            }
        },
        "required": ["claims", "total_claims"]
    }
}', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't', NULL, NULL);


ALTER TABLE "project"."figures_section_history" ADD COLUMN "element_explanations" text;


UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 18;
UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 20;
UPDATE "prompt"."prompt" SET "name" = 'background_description_prompt' WHERE "prompt_id" = 25;


UPDATE "prompt"."prompt" SET "is_selected"=FALSE WHERE "prompt_id"=35;
UPDATE "prompt"."prompt" SET "is_selected"=TRUE WHERE "prompt_id"=31;

INSERT INTO "prompt"."prompt_seq"
    ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls")
VALUES
    (260, 8, 33, 'flowchart_description', 'user', 'All steps numbers, without sub-steps from {Steps_sub-steps}', '{"name": "generate_all_step_titles", "parameters": {"type": "object", "properties": {"steps": {"type": "array", "items": {"type": "object", "properties": {"step_num": {"type": "number"}}}, "description": "generate all step number from output"}}}}', NULL, '{"project": ["steps"]}', NULL, NULL, NULL, 'f', 'gpt-4-1106-preview', NULL),
    (261, 9, 33, 'flowchart_description', 'user', 'Step 10: Our goal is to co-relate all the entity actions from text ####entity_actions_rewritten#### with all the step numbers from {Steps_sub-steps} and the claims from {Method_claims}. Ensure all the entity actions from text ####entity_actions_rewritten#### are co-related with all the step numbers from {Steps_sub-steps} and all the step numbers are mentioned in the output. For every entity action, also extract all the mathematical construct or parameters or metrics/measurements associated with it from text ####current invention#### and text ####claims####. For all entity actions from text ####entity_actions_rewritten#### also extract all the definitions/explanations of every technical term in the entity action from text ####current invention.  Output of this step in the following format: ==claim_step_actions== Claim 1:- entity action 1, all entity action details/definitions/parameters- steps from {Steps_sub-steps}, entity action 2, all entity action details/definitions/parameters, components etc – Steps from step {Steps_sub-steps}, Claim 2 : entity action 1, all entity action details/definitions/parameters - steps, entity action 2, all entity action details/definitions/parameters – steps from step {Steps_sub-steps} etc and so on for all cllaims

Step 11: Re-run step 10 till all the claims from Step 5 are co-related with the entity actions from text ####entity_actions_rewritten#### and referenced with the relevant step numbers from {Steps_sub-steps}.', NULL, NULL, '{"project": ["claim_step_actions"]}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', NULL),
    (262, 10, 33, 'flowchart_description', 'system', 'Use the following inputs:  1. ####Claims####
2. steps and sub-steps/parallel steps in ####steps_sub-steps#### 
3. Mapping between all the claims, entity actions and the steps from ####claim_step_actions#### for writing a detailed explanation for the chosen step from {steps_sub-steps} below. 

Choose the step {{step_num}} and its sub-steps (if any) for the explanation. Define all the entity actions for all the steps and sub-steps. The definitions must include what the entity actions are in the real world, the entities involved, what do the entities do and why do they do what they do. The definition goal is to 
explain how all the entity actions are manifested/practiced by the chosen step and it’s sub-steps from the output of ####claim_step_actions####. In this explanation, include all the details/definitions/parameters/mechanism/structure/working/properties/mathematical construct/metrics/measurements/other forms of all the entities and all the entity actions manifested/practiced by the chosen step and it’s sub-steps from the output of ####claim_step_actions####.  Include implicit entities/steps/working/components/parts/conditions/ranges that will explain all the entity actions of/by/on the entities involved for the chosen step and sub-step only so that a technical expert can understand the entity actions of all entities in the chosen step and sub-step without having to make any assumptions.  Write the explanation of the chosen step and sub-step only. For the chosen step and sub-step, explain in detail all the entities and all the entity actions from ####claim_step_actions#### in a paragraph format by referencing the step numbers from ####steps_sub-steps####. Write the explanation in about 250 words for the chosen step and its sub-step. ', NULL, '{"project": ["flowchart_main_element_nums"]}', NULL, NULL, NULL, 'Start', NULL, 'gpt-4-1106-preview', NULL),
    (263, 11, 33, 'flowchart_description', 'user', 'Current Invention:
####{{invention}}####

Claims:
####{{claims}}####

steps_sub-steps:
####{{element_explanations}}####

claim_step_actions:
####{{claim_step_actions}}####', NULL, '{"project": ["invention", "claims", "element_explanations", "claim_step_actions"]}', '{"project": []}', NULL, NULL, '', NULL, 'gpt-4-1106-preview', 't'),
    (264, 12, 33, 'flowchart_description', 'user', 'Revise the explanation by doing the following: (1) removing the adjectives/superlatives for all the entities and their actions (2) Ensuring no explcit references are made to any claim linked to the step or the sub-step (3) Ensuring all the step and sub-step numbers are written/referenced in the explanation (4) Avoiding patent profanity terms like "invention", "entity", "entities", "alternative of each entity", "layman", "implicit component", "technical write-up" and "entity action", "real-world", "claim", "claims" etc. (5) Avoiding use of superlatives like "critical", "most important", "crucial", "important" etc.', NULL, NULL, '{"project": ["flowchart_description"]}', NULL, NULL, 'End', 't', 'gpt-4-1106-preview', NULL),
    (265, 12, 34, 'block_diagram_description', 'user', 'System and all main components from {component_sub-component}', '{"name": "generate_all_step_titles", "parameters": {"type": "object", "properties": {"steps": {"type": "array", "items": {"type": "object", "properties": {"step_num": {"type": "number"}}}, "description": "generate all step number from output"}}}}', NULL, '{"project": ["steps"]}', NULL, NULL, NULL, 'f', NULL, NULL),
    (266, 13, 34, 'block_diagram_description', 'user', 'Step 12: Our goal is to Co-relate all the specific entity actions associated with ####current invention#### in all the claims from text ####entity_actions_rewritten #### with all the components from Step 5.8. Ensure all entity actions from text ####entity_actions_rewritten#### are co-related with all the components from Step 5.8 and all the components numbers are mentioned in the output. For every entity action, also extract the mathematical construct or parameters or metrics/measurements associated with it from text ####current invention####. For all entity actions from text ####entity_actions_rewritten #### also extract all the definitions/explanations of every technical term in the entity action from text ####current invention####. Output - Claim 1:- entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, all entity action details/definitions/parameters, entities, components etc. Claim 2 : entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, entity action entity action 1, all entity action details/definitions/parameters, entities, components etc and so on for every claim.

Step 13: Ensure all the components from Step 5.8  are referenced in the output from Step 12. Do not ignore any component from from Step 5.8 in the output from Step 12. Do not repeat the step instructions in the output. ', NULL, NULL, '{"project": ["claim_step_actions"]}', NULL, NULL, NULL, NULL, NULL, NULL),
    (267, 14, 34, 'block_diagram_description', 'system', 'I am giving you the following inputs to write a detailed explanation for:
1. ####Claims####
2. co-relation between entities from ####current invention#### and the various components-sub components in ####components_entities#### that when working together enable the system to function
3. Mapping between all the claims, entity actions and the components from ####claims_component_action####

Step 1: Choose the {{step_num}} component and its sub-components from ####components_entities####.  The explanation should be structured as follows, with each section addressing the specific points mentioned:
==Introduction_{{step_num}}==
a) Briefly introduce the component and its significance in the context of its application.
==Component_and_sub-component_overview_{{step_num}}== ) Provide a Component and sub-component Overview (Referencing ####components_entities#### ) where you need to reference, define, and explain all the entities that comprise this component and sub-component, focusing on their characteristics, roles, and how they contribute to the component''s function.

Number all the components and sub-components from ####components_entities#### in the explanation. Do not refer to the words like "entity", "entities", "claim", "crucial" etc. in the explanation. Write the output of ==Introduction_{{step_num}}==, ==Component_and_sub-component_overview_{{step_num}}==', NULL, '{"project": ["flowchart_main_element_nums"]}', NULL, NULL, NULL, 'Start', NULL, 'gpt-4-1106-preview', NULL),
    (268, 15, 34, 'block_diagram_description', 'user', 'Current Invention:
####{{invention}}####

Claims:
####{{claims}}####

components_entities:
####{{response_step3}}####

claims_component_action:
####{{claim_step_actions}}####', NULL, '{"project": ["invention", "claims", "response_step3", "claim_step_actions"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', 't'),
    (269, 16, 34, 'block_diagram_description', 'user', 'Explain the Working of the chosen {{step_num}} component and it''s sub-component above Referencing ####claims_component_action####. Ensure that the working/entity actions of the component and sub-component is structured coherently, with each entity action explanation flowing logically into the next. The language should be technical yet clear, catering to a professional audience with the aim of providing a thorough understanding of the component''s workings. :
(a) Reference, define and describe in detail all the entity actions associated with all the entities of the chosen component and its sub-components, as mapped in ####claims_component_action#### so that a technical person can understand without making any assumptions.  (do not refer to the entity action explicitly) 
(b) For each entity action, explain its nature (what), purpose (why), context (when and under what conditions), and method (how). 
(c) Use your knowledge base to include any implicit entities, components, actions, or details not explicitly mentioned in ####claims_component_action#### but crucial for a complete understanding of all the entity actions and how they flow logically into one another for the working of the system. 

Number the components and sub-components from ####components_entities#### in the explanation. Do not number entities or refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Do not repeat anything from the explanation that explains the entities comprising the component and sub-component from above.  ==explanation_{{step_num}}==  Write the output of ==explanation_{{step_num}}==  in 150 words', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', NULL),
    (270, 17, 34, 'block_diagram_description', 'user', 'Combine the Introduction_{{step_num}}, Component_and_sub-component_overview_{{step_num}} and explanation_{{step_num}} of component {{step_num}}.   Our goal is only to state facts about the component/sub-component and it''s working, it''s real world manifestation and not use any adjectives/language that deviates from that goal. To achieve this goal: Rewrite (a) by removing the adjectives/superlatives for all the entities and their actions. Remove patent profanity terms  like "invention", "entity", "entities", "alternative of each entity", "laymen", "implicit component", "technical write-up" and "entity action", "real-world" etc. (b) Also, remove superlatives like "critical", "most important", "crucial", "important"etc. (c) Do not use titles like "Introduction" and "component and sub-component overview" etc. in the output. (d) Write the output in a multiple paragraphs without removing reference numbers for all components/entities from the input.', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": ["flowchart_description"]}', NULL, NULL, 'End', 't', 'gpt-4-1106-preview', NULL),
    (271, 12, 35, 'block_diagram_description_with_figures', 'user', 'System and all main components from step 5.7', '{"name": "generate_all_step_titles", "parameters": {"type": "object", "properties": {"steps": {"type": "array", "items": {"type": "object", "properties": {"step_num": {"type": "number"}}}, "description": "generate all step number from output"}}}}', NULL, '{"project": ["steps"]}', NULL, NULL, NULL, 'f', NULL, NULL),
    (272, 13, 35, 'block_diagram_description_with_figures', 'user', 'Step 12: Our goal is to Co-relate all the specific entity actions associated with ####current invention#### in all the claims from text ####entity_actions_rewritten #### with all the components from Step 5.8. Ensure all entity actions from text ####entity_actions_rewritten#### are co-related with all the components from Step 5.8 and all the components numbers are mentioned in the output. For every entity action, also extract the mathematical construct or parameters or metrics/measurements associated with it from text ####current invention####. For all entity actions from text ####entity_actions_rewritten #### also extract all the definitions/explanations of every technical term in the entity action from text ####current invention####. Output - Claim 1:- entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, all entity action details/definitions/parameters, entities, components etc. Claim 2 : entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, entity action entity action 1, all entity action details/definitions/parameters, entities, components etc and so on for every claim.

Step 13: Ensure all the components from Step 5.8  are referenced in the output from Step 12. Do not ignore any component from from Step 5.8 in the output from Step 12. Do not repeat the step instructions in the output. ', NULL, NULL, '{"project": ["claim_step_actions"]}', NULL, NULL, NULL, NULL, NULL, NULL),
    (273, 14, 35, 'block_diagram_description_with_figures', 'user', '####text 1#### is in the format [Figure] ####content####

Text 1
{{user_figures_text}}', NULL, '{"project": ["user_figures_text"]}', NULL, NULL, NULL, '', NULL, NULL, NULL),
    (274, 15, 35, 'block_diagram_description_with_figures', 'user', 'Step 17: Identify the specific component or sub-component and their respective reference numbers from the output of step 12 that is closely associated with the input ####text 1####. Provide the reference number and name of the associated component from ####text 1#### also for each Figure. ', NULL, NULL, '{"project": ["references_explanation"]}', NULL, NULL, '', NULL, NULL, NULL),
    (276, 17, 35, 'block_diagram_description_with_figures', 'system', 'I am giving you the following inputs to write a detailed explanation for:
1. ####Claims####
2. co-relation between entities from ####current invention#### and the various components-sub components in ####components_entities#### that when working together enable the system to function
3. Mapping between all the claims, entity actions and the components from ####claims_component_action####

Step 1: Choose the {{step_num}} component and its sub-components from ####components_entities####.  The explanation should be structured as follows, with each section addressing the specific points mentioned:
==Introduction_{{step_num}}==
a) Briefly introduce the component and its significance in the context of its application.
==Component_and_sub-component_overview_{{step_num}}== ) Provide a Component and sub-component Overview (Referencing ####components_entities#### ) where you need to reference, define, and explain all the entities that comprise this component and sub-component, focusing on their characteristics, roles, and how they contribute to the component''s function.

Number all the components and sub-components from ####components_entities#### in the explanation. Do not refer to the words like "entity", "entities", "claim", "crucial" etc. in the explanation. Write the output of ==Introduction_{{step_num}}==, ==Component_and_sub-component_overview_{{step_num}}==', NULL, '{"project": ["flowchart_main_element_nums"]}', NULL, NULL, NULL, 'Start', NULL, 'gpt-4-1106-preview', NULL),
    (277, 18, 35, 'block_diagram_description_with_figures', 'user', 'Current Invention:
####{{invention}}####

Claims:
####{{claims}}####

components_entities:
####{{response_step3}}####

claims_component_action:
####{{claim_step_actions}}####  component_references: ####{{references_explanation}}####', NULL, '{"project": ["invention", "claims", "response_step3", "claim_step_actions", "references_explanation"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', 't'),
    (278, 19, 35, 'block_diagram_description_with_figures', 'user', 'Explain the Working of the chosen {{step_num}} component and it''s sub-component above Referencing ####claims_component_action#### and ####component_references####. Ensure that the working/entity actions of the component and sub-component is structured coherently, with each entity action explanation flowing logically into the next. The language should be technical yet clear, catering to a professional audience with the aim of providing a thorough understanding of the component''s workings. :
(a) Reference, define and describe in detail all the entity actions associated with all the entities of the chosen component and its sub-components, as mapped in ####claims_component_action#### and ####component_references#### so that a technical person can understand without making any assumptions.  (do not refer to the entity action explicitly) 
(b) For each entity action, explain its nature (what), purpose (why), context (when and under what conditions), and method (how). 
(c) Use your knowledge base to include any implicit entities, components, actions, or details not explicitly mentioned in ####claims_component_action#### and ####component_references#### but crucial for a complete understanding of all the entity actions and how they flow logically into one another for the working of the system. 

Number the components and sub-components from ####components_entities#### in the explanation. Do not number entities or refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Do not repeat anything from the explanation that explains the entities comprising the component and sub-component from above.  ==explanation_{{step_num}}==  Write the output of ==explanation_{{step_num}}==  in 150 words', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": []}', NULL, NULL, NULL, NULL, 'gpt-4-1106-preview', NULL),
    (279, 20, 35, 'block_diagram_description_with_figures', 'user', 'Combine the Introduction_{{step_num}}, Component_and_sub-component_overview_{{step_num}} and explanation_{{step_num}} of component {{step_num}}.   Our goal is only to state facts about the component/sub-component and it''s working, it''s real world manifestation and not use any adjectives/language that deviates from that goal. To achieve this goal: Rewrite (a) by removing the adjectives/superlatives for all the entities and their actions. Remove patent profanity terms  like "invention", "entity", "entities", "alternative of each entity", "laymen", "implicit component", "technical write-up" and "entity action", "real-world" etc. (b) Also, remove superlatives like "critical", "most important", "crucial", "important"etc. (c) Do not use titles like "Introduction" and "component and sub-component overview" etc. in the output. (d) Write the output in a multiple paragraphs without removing reference numbers for all components/entities from the input.', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": ["flowchart_description"]}', NULL, NULL, 'End', 't', 'gpt-4-1106-preview', NULL);
