UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 49: Print all the 20 claims which includes independent claims from {independent_claims} and dependent claims from output of Step 40 in the proper order by following the steps given: (a) Print any one independent claim from {independent_claims} first followed by all the dependent claims from Step 40 that depend on it before printing the next independent claim (b) Order all the dependent claims that reference the same independent claim under it (c) Number the claims in the descending order. Claims:' WHERE "prompt_seq_id" = 240;



ALTER TABLE "prompt"."execute_prompts" ALTER COLUMN "is_error" SET DEFAULT '''Success''';


DROP INDEX prompt."execute_prompts_uniq";
CREATE UNIQUE INDEX "execute_prompts_uniq" ON "prompt"."execute_prompts"("project_id","section_type","section_history_id","is_error","prompt_seq_id","repeat_seq_id");

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 30;

UPDATE "prompt"."prompt" SET "is_selected" = 'f' WHERE "prompt_id" = 28;

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (36, 'claims', 'V4', 't');

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected") VALUES (37, 'claims_eu', 'V2', 't');

ALTER TABLE "prompt"."prompt_seq"
ADD COLUMN "max_tokens" int8 DEFAULT 4096;

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens") VALUES
(281, 1, 36, 'claims', 'system', 'I will provide you ####current invention####. Please write the claims for the current invention according to the instructions given below:

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

', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(282, 2, 36, 'claims', 'user', 'current invention: ####{{invention}}####', '{
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
            }                       
        },
        "required": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes"]
    },
    "description": "Get all intermediate results of the Claims for Step 1 to Step 4.2"
}', '{"project": ["invention"]}', '{"project": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes"]}', NULL, NULL, NULL, NULL, NULL, NULL, 8192),
(283, 3, 36, 'claims', 'user', 'Step 5: Identify all the direct and indirect entity actions of all the entities from {entities} using text ####current invention####. Generalise the language for all entity actions from text ####current invention####. Ensure the generalised language while broadening the scope of action retains the technical essence in context of ####current invention#### and is not vague. Use specifics for the entity actions from text ####current invention#### where necessary to avoid being vague. Use this format for output: ==entity_generalised_actions== Entity 1 from {entities}-> Entity 1 Action 1 -> generalised language for Entity 1 Action; Entity 1 from {entities} -> Entity 1 Action 2 -> generalised language for Entity Action 2, Entity 2 from {entities} -> Entity 2 Action 1 -> generalised language for Entity 2 Action 1 etc. 

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==', '{
    "name": "extract_intermediate_results_step_5_6",
    "parameters": {
        "type": "object",
        "properties": {
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
        "required":   ["entity_generalised_actions",
"novelty", "necessary_features", "optional_features"]
    },
    "description": "Get all intermediate results of the Claims for Step 5 to Step 6"
}', NULL, '{"project": ["entity_generalised_actions", "novelty", "necessary_features", "optional_features"]}', NULL, NULL, NULL, NULL, NULL, NULL, 8192),
(284, 4, 36, 'claims', 'user', 'Step 9: You are a patent attorney. Your aim is to draft patent claims for text ####current invention#### by following Steps 10 to 29. When drafting claims, use the generalised language for all entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for entity actions from {entity_generalised_actions} without being vague. When writing a claim it is important to describe how the various entities are structured and how the various entities interact and connect.

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
', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(285, 5, 36, 'claims', 'user', 'Step 30: Provide at least 2 independent claims, following steps from Step 10 to Step 29.  

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
}', '{"template": ["claim_template"]}', '{"project": ["independent_claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(286, 6, 36, 'claims', 'user', 'Step 40: Write all the dependent claims, following steps from Step 10 to Step 29 such that the total number of independent claims from {independent_claims} and dependent claims is 20. Do not print output for this step. Ensure all the dependent claims reference the respective independent claims only. Referencing other dependent claims is not preferred. 

Step 43: Using inputs from {entity_attributes},  ensure the dependent claims from Step 40 specify all the specific entities and all their corresponding specific attributes referenced in the respective independent claims on which they are dependent. The dependent claims must not repeat {entity_attributes}  already mentioned in the independent claims. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 43.1: Write additional dependent claims from Step 40 to distinctly relate to the respective independent claim on which it is dependent by specifying the generalised entity and its attributes from {entity_attributes} not covered from Step 43. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 44: Add additional dependent claims from Step 40 by specifying all the optional features from {optional_features} in the dependent claims. Ensure that the dependent claim cites the optional features from {optional_features} and cites all the associated specific attributes of all the {optional_features} using the specific name/form of entities from {entity_attributes} when writing the claim. Do not print output for this step.   Step 44.1: Once all the {optional_features} and {entity_attributes}are covered in the claims from Step 40, add additional dependent claims from by specifying features using your own knowledge base in context of the {entity_generalised_actions} and {novelty} to broaden the scope of the invention from ####current invention####. 

Step 45: Ensure none of the dependent claims from Step 40 repeat any entity action from {entity_generalised_actions} or any entity attributes/properties/quantities from {entity_attributes} mentioned in the independent claims from {independent_claims} or in other dependent claims. Do not print output for this step. 

Step 46: Ensure, all the dependent claims from Step 40 reference only the independent claim on which it is dependent. Referencing other dependent claims is not preferred. Referencing more than one independent claim is not allowed. Do not print output for this step. 

Step 47: Ensure that the dependent claims from Step 40 do not contain phrases like  ".....dependent claim.....". Do not print output for this step. 

Step 48: Ensure that the step 40 generates adequate number of dependent claims such that the total number of independent claims and dependent claims for the invention is 20. Include all the independent claims from {independent_claims} in the 20 claims. Do not print output for this step.                                          ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(287, 7, 36, 'claims', 'user', 'Step 49: Print all the 20 claims which includes independent claims from {independent_claims} and dependent claims from output of Step 40 in the proper order by following the steps given: (a) Print any one independent claim from {independent_claims} first followed by all the dependent claims from Step 40 that depend on it before printing the next independent claim (b) Order all the dependent claims that reference the same independent claim under it (c) Number the claims in the descending order. Claims:', '{
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
}', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't', NULL, NULL, 4096),
(288, 1, 37, 'claims_eu', 'system', 'I will provide you ####current invention####. Please write the claims for the current invention according to the instructions given below:

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

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==

Step 8: Identify/define prior art that is known or widely used in the field related to the text ####current invention####. Use the generalised language of entities from {entity_generalised} or {entity_generalised_sequence} to describe the prior art .Output: ==pre_characterising_aspect==

Step 8.1: Identify/define the characterising elements of the invention using {necessary_features} in context of the {pre_characterising_aspect}.  Use the generalised language of entities from {entity_generalised} or {entity_generalised_sequence} and generalised language of entity actions from {entity_generalised_actions} to describe the characterising elements. Output: ==characterising_elements==

', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(289, 2, 37, 'claims_eu', 'user', 'current invention: ####{{invention}}####', '{
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
            "entities_without_sequence": {
                "type": "string",
                "description": "entities with out sequence from Step 3.1"
            },
            "entity_generalised": {
                "type": "string",
                "description": "Generalized Entities without sequence from Step 4 "
            },
            "entity_generalised_sequence": {
                "type": "string",
                "description": "Generalised entities with sequence preserved from Step 4.1."
            },
            "entity_attributes": {
                "type": "string",
                "description": "entity attributes from Step 4.2."
            }
        },
        "required": [
            "entities",
            "specific_attributes",
            "entities_with_sequence",
            "entities_without_sequence",
            "entity_generalised",
            "entity_generalised_sequence",
            "entity_attributes"
        ]
    },
    "description": "Get all intermediate results of the Claims for Step 1 to Step 4.2"
}', '{"project": ["invention"]}', '{"project": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes"]}', NULL, NULL, NULL, NULL, NULL, NULL, 8192),
(290, 3, 37, 'claims_eu', 'user', 'Step 5 to Step 6', '{
    "name": "extract_intermediate_results_5_6",
    "parameters": {
        "type": "object",
        "properties": {
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
        "required": [
            "entity_generalised_actions",
            "novelty",
            "necessary_features",
            "optional_features"
        ]
    },
    "description": "Get all intermediate results of the Claims for Step 5 to Step 6"
}', NULL, '{"project": ["entity_generalised_actions", "novelty", "necessary_features", "optional_features"]}', NULL, NULL, NULL, NULL, NULL, NULL, 8192),
(291, 4, 37, 'claims_eu', 'user', 'Step 8: Identify/define prior art that is known or widely used in the field related to the text ####current invention####. Use the generalised language of entities from {entity_generalised} or {entity_generalised_sequence} to describe the prior art. Output: ==pre_characterising_aspect==

Step 8.1: Identify/define the characterising elements of the invention using {necessary_features} in context of the {pre_characterising_aspect}.  Use the generalised language of entities from {entity_generalised} or {entity_generalised_sequence} and generalised language of entity actions from {entity_generalised_actions} to describe the characterising elements. Output: ==characterising_elements==

', '{
    "name": "extract_intermediate_results_2",
    "parameters": {
        "type": "object",
        "properties": {
            "pre_characterising_aspect": {
                "type": "string",
                "description": "Pre Characterising Aspect from Step 8"
            },
            "characterising_elements": {
                "type": "string",
                "description": "Characterising Elements from Step 8.1"
            }
        },
        "required": [
            "pre_characterising_aspect",
            "characterising_elements"
        ]
    },
    "description": "Get pre-characterising aspect and characterising elements of the Claims for Step 8 to Step 8.1"
}', NULL, '{"project": ["pre_characterising_aspect", "characterising_elements"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(292, 5, 37, 'claims_eu', 'user', 'Step 9: You are a European patent attorney. Your aim is to draft patent claims for text ####current invention #### by following Steps. When drafting claims, use the generalised language for all entities from {entities_generalised} and generalised language for entity actions from {entity_generalised_actions} without being vague. When writing a claim it is important to describe how the various entities are structured and how the various entities interact and connect.

Step 10: Draft one 2 part independent patent claim suitable for filing a patent application with the European patent office for a method/system/ process/ apparatus/machine/device/product/composition etc in context of the invention from ####current invention####. Using the {pre_characterising_aspect}, please draft the preamble of the two-part European patent independent claim. This preamble should succinctly summarise the known features or state of the art relevant to the invention. Then, using the characterising aspects of the invention from {characterising_elements}, draft the characterising portion of the claim. The characterising portion should clearly specify the novel features of the invention that distinguish it from the prior art and contribute to solving the technical problem. Ensure that the claim is structured to highlight the inventive step and aligns with the requirements of the European Patent Office. Do not use the any sub-titles in the claim draft. No explicit reference like previously known as is allowed. Pring Output in this format: ==independent_claim==

Step 12: Ensure that the independent claims from {independent_claims} are truly independent and not dependent on other claims. It is not allowed for Independent claims to reference any other claims. Do not print output for this step. 

Step 13: Ensure the {independent_claims} do not use phrases like "previously known"/ "pre-characterising", "characterising" aspects, etc. for entities or entity actions anywhere in the claims.  Do not print output for this step.   Step 13.1 Use the formatting style of following ####sample claim#### to modify the format of the claims generated in step 10 (format independent claims where one element is below the other element and avoid spacing between the elements of that claim). Print the formatted claims. Do not print step number   Sample claim:
####{{claim_eu_template}}####
', NULL, '{"template": ["claim_eu_template"]}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(293, 6, 37, 'claims_eu', 'user', 'Step 10, Step 12, Step 13', '{
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
}', NULL, '{"project": ["independent_claims"]}', NULL, NULL, NULL, NULL, NULL, NULL, 4096),
(294, 7, 37, 'claims_eu', 'user', 'Step 14: Use {entity_attributes} for defining the borders of the invention with detailing and specificity by adding dependent claims. The dependent claims must specify all the specific attributes and specific entity forms/names for all generalised entities from {entity_generalised} referenced in the independent claims from {independent_claims}. {entity_attributes} stores the mapping between generalised entity from {entity_generalised} with it''s respective attributes from {specific_attributes} and specific entity form/name from {entities}. The dependent claims should not repeat/recite entity attributes/features already mentioned in the independent claims. 

Step 15: Write additional dependent claims using the additional features/actions of entities from {optional_features} and not covered in independent claims. 

Step 16: Ensure, the dependent claims reference the relevant independent claim on which it is dependent. Dependent claims can reference either a  independent claim on which it is dependent or other dependent claims. The dependent claim can depend on multiple claims.   

Step 17: Multiple dependent claims are allowed as per the EPO guidelines. 

Step 18: Ensure the dependent claims do not recite anything already recited/specified from {entity_attributes}in the {independent_claims}. 

Step 19:  Replace terms like "mechanism", "element", or "member" with terms conveying specific functions such as "coupler", "support", or "detector."

Step 20: Provide antecedent basis for entities used in all the claims and introduce features properly before reciting their functionality. Every entity or noun in the claim, when introduced, should be introduced by an article usually "a" or "an" and not article "the", except when introduced as a plurality or as "means".  When introducing plurality, avoid the use of article "the". Every subsequent reference to a previously introduced entity should be prefaced "the" or "said" (some practitioners use "said" to refer to entities, and "the" for other features). Adjectives may be dropped in subsequent references of entities only if the reference to the entity is unambiguous: "supporting member" can be later referenced as "said member", but if the invention also includes an "oscillating member", subsequent references should be "said supporting member" and "said oscillating member". Importantly, do not add limiting adjectives in subsequent references as given in the example ("said horizontally supporting member"). A claim may rely on itself for antecedent basis (e.g.: "a handle connected to the gear, the handle being axially aligned with the support member")

Step 21:  In claims with multiple options, use "or" instead of "and" for clarity and proper scope. 

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

Step 30: Aim for a total of 13 claims including one independent claim and other dependent claims. 
', '{
    "name": "generate_claims",
    "parameters": {
        "type": "object",
        "properties": {
            "claims": {
                "type": "string",
                "description": "All {independent_claims} and Step 30 output."
            },
            "total_claims":{
                "type": "number"
            }
        },
        "required": ["claims", "total_claims"]
    }
}', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't', NULL, NULL, 4096);

UPDATE "prompt"."prompt_seq" SET "max_tokens" = 8192 WHERE "prompt_seq_id" = 282;
UPDATE "prompt"."prompt_seq" SET "max_tokens" = 8192 WHERE "prompt_seq_id" = 266;
UPDATE "prompt"."prompt_seq" SET "max_tokens" = 8192 WHERE "prompt_seq_id" = 225;
UPDATE "prompt"."prompt_seq" SET "max_tokens" = 8192 WHERE "prompt_seq_id" = 28;

ALTER TABLE "prompt"."execute_prompts" ALTER COLUMN "created_at" SET DEFAULT now();

UPDATE "prompt"."prompt_seq" SET "instructions" = 'I am giving you the following inputs to write a detailed explanation for:
1. ####Claims####
2. co-relation between entities from ####current invention#### and the various components-sub components in ####components_entities#### that when working together enable the system to function
3. Mapping between all the claims, entity actions and the components from ####claims_component_action####

Step 1: Choose the {{step_num}} component and its sub-components from ####components_entities####.  The explanation should be structured as follows, with each section addressing the specific points mentioned:
==Introduction_{{step_num}}==
a) Briefly introduce the component and its significance in the context of its application.
==Component_and_sub-component_overview_{{step_num}}== ) Provide a Component and sub-component Overview (Referencing ####components_entities#### ) where you need to reference, define, and explain all the entities that comprise this component and sub-component, focusing on their characteristics, roles, and how they contribute to the component''s function.

Number all the components and sub-components from ####components_entities#### in the explanation. Do not refer to the words like "entity", "entities", "claim", "crucial" etc. in the explanation. Write the output of ==Introduction_{{step_num}}==, ==Component_and_sub-component_overview_{{step_num}}== in 50 words' WHERE "prompt_seq_id" = 267;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Explain the Working of the chosen {{step_num}} component and it''s sub-component above Referencing ####claims_component_action####. Ensure that the working/entity actions of the component and sub-component is structured coherently, with each entity action explanation flowing logically into the next. The language should be technical yet clear, catering to a professional audience with the aim of providing a thorough understanding of the component''s workings. :
(a) Reference, define and describe in detail all the entity actions associated with all the entities of the chosen component and its sub-components, as mapped in ####claims_component_action#### so that a technical person can understand without making any assumptions.  (do not refer to the entity action explicitly) 
(b) For each entity action, explain its nature (what), purpose (why), context (when and under what conditions), and method (how). 
(c) Use your knowledge base to include any implicit entities, components, actions, or details not explicitly mentioned in ####claims_component_action#### but crucial for a complete understanding of all the entity actions and how they flow logically into one another for the working of the system. 

Number the components and sub-components from ####components_entities#### in the explanation. Do not number entities or refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. Do not repeat anything from the explanation that explains the entities comprising the component and sub-component from above.  ==explanation_{{step_num}}==  Write the output of ==explanation_{{step_num}}==  in 200 words' WHERE "prompt_seq_id" = 269;

DELETE FROM "prompt"."prompt_seq" WHERE "prompt_seq_id" = 33 OR "prompt_seq_id" = 179;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text #### entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then perform steps 4 to 9.
If the text ####Claims#### do not include a method claim, print output: "@@@No-Method-Claims@@@".

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using entity action from text ####entity action####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step, identify the sub-steps/parallel steps that are optional details to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step in an even numbering series with increment of 2 for each step. Organise the output of the steps and sub-steps in a logical sequence, all together, in the following format: First step number is 100, its sub-step number will be 100-a, 100-b, Second step number will 102, the sub-step will be 102-a, 102-b etc.

Step 7: Identify the decision making step from the output of step 6.' WHERE "prompt_seq_id" = 30;


UPDATE "prompt"."prompt_seq" SET "outputs"='{"project":["check_is_diagram_available"]}' WHERE "prompt_seq_id"=139 OR "prompt_seq_id"=178;


DELETE FROM "prompt"."prompt_seq" WHERE "prompt_seq_id"=140 OR "prompt_seq_id"=179;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process) do not do anything.

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step in the following format: ==component_sub-component==200 -> explanation -> claim number, 200-a -> explanation -> claim number, etc.' WHERE "prompt_seq_id"=176;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from ####current invention####, claim 2: Entity action in claims-entity action from ####current invention#### etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process) do not do anything.

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step in the following format: ==component_sub-component==200 -> explanation -> claim number, 200-a -> explanation -> claim number, etc.

I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc. 

Step 7: Identify the decision making step from ==Steps_sub-steps==. Output of this step in the following format: ==Decision_step==

' WHERE "prompt_seq_id" = 137;



UPDATE "prompt"."prompt_seq" SET "prompt_id" = 17 WHERE "prompt_seq_id" = 144;

UPDATE "prompt"."prompt_seq" SET "role" = 'system' WHERE "prompt_seq_id" = 187;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'component_sub-component : {{element_explanations}} \n\n Step 20, Step 22', "inputs" = '{"project" : ["element_explanations"]}' WHERE "prompt_seq_id" = 188;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 16: Provide the mermaid script/syntax for ==component_sub-component==. Do not print output for this step.

Step 17: Choose the layout for output from step 16. Use graph TB for a top-down layout or graph LR for a left-right layout. Do not print output for this step.

Step 18: Define the nodes for output from step 16. Use square brackets for regular nodes (e.g., 200["Host System"]). Do not print output for this step.

Step 19: For the Mermaid script/syntax from step 16, use the word "subgraph" to start a subgraph and the word "end" to close it. Define all nodes that belong to the subgraph. Define the links for  all the nodes at the end. Do not print output for this step.

Step 20: Review and adjust the Mermaid script/syntax as needed. Refer the example given below for following the style of the mermaid. This sample is for reference only, do not follow numbering of the sample given below. Keep the numbering same as given in the text ==component_sub-component== and also not mention claim numbers in the mermaid codes.

For example, 
graph LR
subgraph 200["Host System"]
  210["Host Interface Unit"]
end
subgraph 204["Memory Controller"]
  212["Memory Interface Unit"]
  214["Processing Unit"]
end
subgraph 206["Non-Volatile Memory"]
  202["Memory Devices"]
  208["Host Memory"]
  216["Information Units"]
end
200 --- 204
204 --- 206

Print the output in the following format:

Mermaid;

Step 22: Ensure that a valid mermaid syntax has been generated in step 20. . Do not print the output for this step.
' WHERE "prompt_seq_id" = 187;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 31: The output of step 30 is for a block diagram named as figure 2A, 2B, 2C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 2 illustrates, in a block diagram, a computing environment of a VR headset in accordance with certain embodiments.

Brief Description;' WHERE "prompt_seq_id" = 194;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 29: Split the mermaid from Step 20 into multiple mermaids with each mermaid based on the main component and its respective sub-components grouping. Mermaids should only be split and be created for the main component that contain sub-components. Avoid mermaids in Step 29 for the main components that do not contain sub-components. Ensure each of the mermaid splits are meaningful in context of ==component_sub-component==:

Sample Mermaid:

Mermaid 1;

graph TB
subgraph 202["Visual Discomfort Monitor"]
  202-a["User Interaction Handler"]
  202-b["User Data Manager"]
end
202 --- 202-a
202 --- 202-b

Mermaid 2;

graph TB
subgraph 204["Interface Modifier"]
  204-a["Speed Adjuster"]
  204-b["Rotation Calibrator"]
  204-c["Position Regulator"]
end
204 --- 204-a
204 --- 204-b
204 --- 204-c

Output of this step in the following format: ==Fig. 2A_mermaid==, ==Fig. 2B_mermaid==, ==Fig. 2C_mermaid== and so on.' WHERE "prompt_seq_id" = 192;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 28: The output of step 27 is for a flow chart named as figure 2. Generate a brief description of the figure in 1 line. Consider the writing style of sample given below:
' WHERE "prompt_seq_id" = 191;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 16: Provide the mermaid script/syntax for ==component_sub-component==. Do not print output for this step.

Step 17: Choose the layout for output from step 16. Use graph TB for a top-down layout or graph LR for a left-right layout. Do not print output for this step.

Step 18: Define the nodes for output from step 16. Use square brackets for regular nodes (e.g., 200["Host System"]). Do not print output for this step.

Step 19: For the Mermaid script/syntax from step 16, use the word "subgraph" to start a subgraph and the word "end" to close it. Define all nodes that belong to the subgraph. Define the links for  all the nodes at the end. Do not print output for this step.

Step 20: Review and adjust the Mermaid script/syntax as needed. Refer the example given below for following the style of the mermaid. This sample is for reference only, do not follow numbering of the sample given below. Keep the numbering same as given in the text ==component_sub-component== and also not mention claim numbers in the mermaid codes.

For example, 
graph LR
subgraph 200["Host System"]
  210["Host Interface Unit"]
end
subgraph 204["Memory Controller"]
  212["Memory Interface Unit"]
  214["Processing Unit"]
end
subgraph 206["Non-Volatile Memory"]
  202["Memory Devices"]
  208["Host Memory"]
  216["Information Units"]
end
200 --- 204
204 --- 206

Print the output in the following format:

Mermaid;

Step 22: Ensure that a valid mermaid syntax has been generated in step 20. . Do not print the output for this step.' WHERE "prompt_seq_id" = 187;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 26: Using output from step 20, generate one mermaid for all the main components, without the sub-components, which together enable/manifest all the entity actions from all the system/apparatus/device/machine/product claims  in context of ==component_sub-component==.

Sample Mermaid:
graph LR
subgraph 200["Host System"]
  210["Host Interface Unit"]
end
subgraph 204["Memory Controller"]
  212["Memory Interface Unit"]
  214["Processing Unit"]
end
subgraph 206["Non-Volatile Memory"]
  202["Memory Devices"]
  208["Host Memory"]
  216["Information Units"]
end
200 --- 204
204 --- 206

Output of this step in the following format: ==Fig. 2_mermaid==' WHERE "prompt_seq_id" = 189;

delete from prompt.prompt_seq where prompt_seq_id = 137;

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens") VALUES
(137, 1, 16, 'flowchart_common', 'system', 'I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc. 


', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4096);


delete from prompt.prompt_seq where prompt_seq_id = 144;

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream", "model", "multicalls", "max_tokens") VALUES
(144, 8, 17, 'flowchart_diagram', 'system', 'Step 7: Identify the decision making step from ==Steps_sub-steps==. Output of this step in the following format: ==Decision_step==
\n component_sub-component : {{element_explanations}} \n\n step 7 ', NULL, '{"project": ["element_explanations"]}', '{"project": []}', NULL, NULL, NULL, NULL, NULL, NULL, 4096);

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 27: The output of step 26 is for a flow chart named as figure 1A, 1B, 1C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 1 illustrates, in a flowchart, operations for using a user profile in accordance with certain embodiments. 

Brief Description;' WHERE "prompt_seq_id" = 152;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 15: Provide the mermaid script/syntax for all steps and sub-steps/parallel steps using ==Steps_sub-steps== by doing the following: For the mermaid script/syntax, understand the output of all steps and sub-steps/parallel steps from ==Steps_sub-steps== in context of ==Decision_step==. ==Decision_step== identifies the decision making step. Using all the details of all the steps and sub-steps/parallel steps from ==Steps_sub-steps== and decision making step from ==Decision_step==, identify nodes, conditions (if any), and different links/paths. Do not print output for this step.

Step 16: Choose the layout for output from Step 15. Use graph TB for a top-down layout or graph LR for a left-right layout. Do not print output for this step.

Step 17: Define the nodes for output from Step 15. Use square brackets for regular nodes e.g., 100["Node A"].  Use curly braces for decision nodes e.g., 102{"Condition B"}. Treat "If" condition nodes as decision nodes. Do not print output for this step.

Step 18: For the Mermaid script/syntax from step 15 define the links/paths between nodes from Step 17 using -->. To add text to the links/paths, use |Link text|. For multiple links/paths between nodes, define each link separately. For decision making link/path, use appropriate messages to handle yes/no cases. For example, a decision node should have two separate links/paths with messages as "yes" and "no". Do not print output for this step.

Step 19: Review and adjust the Mermaid script/syntax as needed. Refer the example given below for following the style of the mermaid. This sample is for reference only, do not follow numbering of the sample given below. Keep the numbering same as given in the text ==Steps_sub-steps== and also, do not mention claim numbers in the mermaid codes. Print the output for this step. 

mermaid
Copy code
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102


Step 20:  Confirm that the yes and no condition from the decision making step from ==Decision_step== has already been considered in the output of Step 19. If no, then re-generate the output from Step 19. Do not print output for this step.
' WHERE "prompt_seq_id" = 145;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 22: Using output from step 19, generate one mermaid for all the steps, without the sub-steps, which together encompass the method in context of ==Steps_sub-steps== and ==Decision_step==.

Sample Mermaid:
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102

Output of this step in the following format: ==Fig. 1_mermaid==' WHERE "prompt_seq_id" = 147;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 24: The output of step 23 is for a flow chart named as figure 1. Generate a brief description of the figure in 1 line. Consider the writing style of sample given below:

FIG. 1 illustrates, in a flowchart, operations for using a user profile in accordance with certain embodiments. 

Brief Description;' WHERE "prompt_seq_id" = 149;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 25: Split the mermaid from Step 19 into multiple mermaids based on the sub-steps grouping where each sub-step group contains a step and it''s respective sub-step from ==Steps_sub-steps==. For any step with sub-step from ==Steps_sub-steps==, ensure that the mermaid is made only for the step and all it''s sub-steps. While generating output for this step, avoid mermaids for the steps that do not contain any sub-steps. Ensure each of the mermaid splits are meaningful in context of ==Steps_sub-steps== and ==Decision_step==.

Sample Mermaid:
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102

Output of this step in the following format: ==Fig. 1A_mermaid==, ==Fig. 1B_mermaid==, ==Fig. 1C_mermaid== and so on.' WHERE "prompt_seq_id" = 150;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 7: Identify the decision making step from ==Steps_sub-steps==. Output of this step in the following format: ==Decision_step==
Steps_sub-steps : {{element_explanations}} \n\n step 7' WHERE "prompt_seq_id" = 144;


UPDATE "prompt"."prompt_seq" SET "instructions"='Step 5: Identify all the direct and indirect entity actions of all the entities from {entity_generalised} and all the entities from  {entity_generalised_sequence} using text ####current invention####. Generalise the language for all entity actions from text ####current invention####. Ensure the generalised language while broadening the scope of action retains the technical essence in context of ####current invention#### and is not vague. Use specifics for the entity actions from text ####current invention#### where necessary to avoid being vague. Use this format for output: ==entity_generalised_actions== Entity 1 from {entities}-> Entity 1 Action 1 -> generalised language for Entity 1 Action; Entity 1 from {entities} -> Entity 1 Action 2 -> generalised language for Entity Action 2, Entity 2 from {entities} -> Entity 2 Action 1 -> generalised language for Entity 2 Action 1 etc. 

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==' WHERE "prompt_seq_id"=283; 

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 25: Identify if ==Steps_sub-steps== contains sub-steps. If it does not contain sub-steps, do not perform Steps 26 to Step 28. Print the following output: @@@No@@@ if no sub-steps identified, @@@Yes@@@ if sub-steps are identified. \n\n Step 26: Split the mermaid from Step 19 into multiple mermaids based on the sub-steps grouping where each sub-step group contains a step and it''s respective sub-step from ==Steps_sub-steps==. For any step with sub-step from ==Steps_sub-steps==, ensure that the mermaid is made only for the step and all it''s sub-steps. While generating output for this step, avoid mermaids for the steps that do not contain any sub-steps. Ensure each of the mermaid splits are meaningful in context of ==Steps_sub-steps== and ==Decision_step==.

Sample Mermaid:
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102

Output of this step in the following format: ==Fig. 1A_mermaid==, ==Fig. 1B_mermaid==, ==Fig. 1C_mermaid== and so on.', "fun_def" = '{
    "name": "generate_multiple_mermaid",
    "parameters": {
        "type": "object",
        "properties": {
            "mermaids": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "mermaid": {
                            "type": "string"
                        }
                    }
                },
                "description": "generate mermaids only if sub-steps are identified in Step 25"
            }
        }
    }
}' WHERE "prompt_seq_id" = 150;




UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 27: Using {mermaid}, identify the goal of the steps in fewer than 20 words.' WHERE "prompt_seq_id" = 190;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 29: Identify if ==component_sub-component== contains sub- components. If it does not contain sub- components, do not perform Steps 30 to Step 32. Print the following output: ==No== if no sub-steps identified, ==Yes== if sub-steps are identified. 

Step 30: Split the mermaid from Step 20 into multiple mermaids with each mermaid based on the main component and its respective sub-components grouping. Mermaids should only be split and be created for the main component that contain sub-components. While generating output for this step, avoid mermaids for the components that do not contain any sub-components. Ensure each of the mermaid splits are meaningful in context of ==component_sub-component==:

Sample Mermaid:

Mermaid 1;

graph TB
subgraph 202["Visual Discomfort Monitor"]
  202-a["User Interaction Handler"]
  202-b["User Data Manager"]
end
202 --- 202-a
202 --- 202-b

Mermaid 2;

graph TB
subgraph 204["Interface Modifier"]
  204-a["Speed Adjuster"]
  204-b["Rotation Calibrator"]
  204-c["Position Regulator"]
end
204 --- 204-a
204 --- 204-b
204 --- 204-c

Output of this step in the following format: ==Fig. 2A_mermaid==, ==Fig. 2B_mermaid==, ==Fig. 2C_mermaid== and so on.' WHERE "prompt_seq_id" = 192;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 31: Using {mermaids}, identify the goal of the steps for each mermaid separately in fewer than 20 words.' WHERE "prompt_seq_id" = 193;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 28: The output of step 27 is for a block diagram named as figure 2. Generate a brief description of the figure in one line. Consider the writing style of sample given below:

FIG. 2 illustrates, in a block diagram, a computing environment of a VR headset in accordance with certain embodiments.

Brief Description;' WHERE "prompt_seq_id" = 191;

UPDATE "prompt"."prompt_seq" SET "fun_def" = '{
    "name": "generate_multiple_mermaid",
    "parameters": {
        "type": "object",
        "properties": {
            "mermaids": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "mermaid": {
                            "type": "string"
                        }
                    }
                },
                "description": "Split mermaid from Step 20 only if sub-components are identified in Step 29"

            }
        }
    }
}' WHERE "prompt_seq_id" = 192;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 32: The output of step 31 is for a block diagram named as figure 2A, 2B, 2C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 2 illustrates, in a block diagram, a computing environment of a VR headset in accordance with certain embodiments.

Brief Description;' WHERE "prompt_seq_id" = 194;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 31: Using {mermaids}, identify the goal for each mermaid separately in fewer than 20 words.' WHERE "prompt_seq_id" = 193;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 27: Using the {mermaids} , identify the goal for each mermaid separately in fewer than 20 words.' WHERE "prompt_seq_id" = 151;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Step 28: The output of step 27 is for a flowchart named as figure 1A, 1B, 1C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 1 illustrates, in a flowchart, operations for using a user profile in accordance with certain embodiments. 

Brief Description;' WHERE "prompt_seq_id" = 152;

UPDATE "prompt"."prompt_seq" SET "instructions"= E'
Current Invention: ####{{invention}}#### \\n\\n entity_generalized_rewritten: ####{{entity_generalized_rewritten}}#### \\n\\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \\n\\n Claims: ####{{claims}}####' WHERE "prompt_seq_id"=138;


UPDATE "prompt"."prompt_seq" SET "instructions"= E'Step 7: Identify the decision making step from ==Steps_sub-steps==. Output of this step in the following format: ==Decision_step==
Steps_sub-steps : {{element_explanations}} \\n\\n step 7' WHERE "prompt_seq_id"=144;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 25: Identify if ==Steps_sub-steps== contains sub-steps. If it does not contain sub-steps, do not perform Steps 26 to Step 28. Print the following output: ==No== if no sub-steps identified, ==Yes== if sub-steps are identified.   Step 26: Split the mermaid from Step 19 into multiple mermaids based on the sub-steps grouping where each sub-step group contains a step and it''s respective sub-step from ==Steps_sub-steps==. For any step with sub-step from ==Steps_sub-steps==, ensure that the mermaid is made only for the step and all it''s sub-steps. While generating output for this step, avoid mermaids for the steps that do not contain any sub-steps. Ensure each of the mermaid splits are meaningful in context of ==Steps_sub-steps== and ==Decision_step==.

Sample Mermaid:
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102

Output of this step in the following format: ==Fig. 1A_mermaid==, ==Fig. 1B_mermaid==, ==Fig. 1C_mermaid== and so on.' WHERE "prompt_seq_id"=150; 

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 27: Using the {mermaids} , identify the goal for each mermaid separately in fewer than 20 words.' WHERE "prompt_seq_id"=151;


UPDATE "prompt"."prompt_seq" SET "instructions"='Step 28: The output of step 27 is for a flowchart named as figure 1A, 1B, 1C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 1 illustrates, in a flowchart, operations for using a user profile in accordance with certain embodiments. 

Brief Description;' WHERE "prompt_seq_id"=152;


UPDATE "prompt"."prompt_seq" SET "instructions"= E'Current Invention: ####{{invention}}#### \\n\\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \\n\\n entity_generalized_rewritten: ####{{entity_generalized_rewritten}}#### \\n\\n Claims: ####{{claims}}#### ' WHERE "prompt_seq_id"=177;


UPDATE "prompt"."prompt_seq" SET "instructions"='I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process) do not do anything.

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step a table format whose table name is ==component_sub-component== with 5 columns having the following headings: Component type - system/component/sub-component, system/component/sub-component name,  system/component/sub-component name, explanation, claim number' WHERE "prompt_seq_id"=176;


UPDATE "prompt"."prompt_seq" SET "instructions"='Step 31: Using {mermaids}, identify the goal for each mermaid separately in fewer than 20 words.' WHERE "prompt_seq_id"=193;

UPDATE "prompt"."prompt_seq" SET "prompt_id"=17 WHERE "prompt_seq_id"=144;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 27: Using {mermaid}, identify the goal of the steps in fewer than 20 words.' WHERE "prompt_seq_id"=190;

UPDATE "prompt"."prompt_seq" SET "instructions"= E'
component_sub-component : {{element_explanations}} \\n\\n Step 16 to Step 22' WHERE "prompt_seq_id"=188 ;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 32: The output of step 31 is for a block diagram named as figure 2A, 2B, 2C and so on. Generate a brief description of each figure in 1 line. Consider the writing style of sample given below:

FIG. 2 illustrates, in a block diagram, a computing environment of a VR headset in accordance with certain embodiments.

Brief Description;' WHERE "prompt_seq_id"=194;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 29: Identify if ==component_sub-component== contains sub- components. If it does not contain sub-components, do not perform Steps 30 to Step 32. Print the following output: ==No== if no sub-components identified, ==Yes== if sub-components are identified. 

Step 30: Split the mermaid from Step 20 into multiple mermaids with each mermaid based on the main component and its respective sub-components grouping. Mermaids should only be split and be created for the main component that contain sub-components. While generating output for this step, avoid mermaids for the components that do not contain any sub-components. Ensure each of the mermaid splits are meaningful in context of ==component_sub-component==:

Sample Mermaid:

Mermaid 1;

graph TB
subgraph 202["Visual Discomfort Monitor"]
  202-a["User Interaction Handler"]
  202-b["User Data Manager"]
end
202 --- 202-a
202 --- 202-b

Mermaid 2;

graph TB
subgraph 204["Interface Modifier"]
  204-a["Speed Adjuster"]
  204-b["Rotation Calibrator"]
  204-c["Position Regulator"]
end
204 --- 204-a
204 --- 204-b
204 --- 204-c

Output of this step in the following format: ==Fig. 2A_mermaid==, ==Fig. 2B_mermaid==, ==Fig. 2C_mermaid== and so on.' WHERE "prompt_seq_id"=192;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 26: Using output from step 20, generate one mermaid for the system and all the components only without the sub-components in context of ===component_sub-component===.

Sample Mermaid:
graph LR
subgraph 200["Host System"]
  210["Host Interface Unit"]
end
subgraph 204["Memory Controller"]
  212["Memory Interface Unit"]
  214["Processing Unit"]
end
subgraph 206["Non-Volatile Memory"]
  202["Memory Devices"]
  208["Host Memory"]
  216["Information Units"]
end
200 --- 204
204 --- 206

Output of this step in the following format: ==Fig. 2_mermaid==' WHERE "prompt_seq_id"=189;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 28: The output of step 27 is for a block diagram named as figure 2. Generate a brief description of the figure in one line. Consider the writing style of sample given below:

FIG. 2 illustrates, in a block diagram, a computing environment of a VR headset in accordance with certain embodiments.

Brief Description;' WHERE "prompt_seq_id"=191;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 5: Identify all the direct and indirect entity actions of all the entities from {entity_generalised} and all the entities from  {entity_generalised_sequence} using text ####current invention####. Generalise the language for all entity actions from text ####current invention####. Ensure the generalised language while broadening the scope of action retains the technical essence in context of ####current invention#### and is not vague. Use specifics for the entity actions from text ####current invention#### where necessary to avoid being vague. Use this format for output: ==entity_generalised_actions== Entity 1 from {entities}-> Entity 1 Action 1 -> generalised language for Entity 1 Action; Entity 1 from {entities} -> Entity 1 Action 2 -> generalised language for Entity Action 2, Entity 2 from {entities} -> Entity 2 Action 1 -> generalised language for Entity 2 Action 1 etc. 

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==' WHERE "prompt_seq_id"=283;

UPDATE "prompt"."prompt_seq" SET "outputs"=NULL WHERE "prompt_seq_id"=187;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 5: Identify all the direct and indirect entity actions of all the entities from {entity_generalised} and all the entities from  {entity_generalised_sequence} using text ####current invention####. Generalise the language for all entity actions from text ####current invention####. Ensure the generalised language while broadening the scope of action retains the technical essence in context of ####current invention#### and is not vague. Use specifics for the entity actions from text ####current invention#### where necessary to avoid being vague. Use this format for output: ==entity_generalised_actions== Entity 1 from {entities}-> Entity 1 Action 1 -> generalised language for Entity 1 Action; Entity 1 from {entities} -> Entity 1 Action 2 -> generalised language for Entity Action 2, Entity 2 from {entities} -> Entity 2 Action 1 -> generalised language for Entity 2 Action 1 etc. 

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==' WHERE "prompt_seq_id"=283;



UPDATE "prompt"."prompt_seq" SET "instructions"='Step 29: Identify if ==component_sub-component== contains sub- components. If it does not contain sub-components, do not perform Steps 30 to Step 32. Print the following output: ==No== if no sub-components identified, ==Yes== if sub-components are identified. 

Step 30: Split the mermaid from Step 20 into multiple mermaids with each mermaid based on the main component and its respective sub-components grouping. Mermaids should only be split and be created for the main component that contain sub-components. While generating output for this step, avoid mermaids for the components that do not contain any sub-components. Ensure each of the mermaid splits are meaningful in context of ==component_sub-component==:

Sample Mermaid:

Mermaid 1;

graph TB
subgraph 202["Visual Discomfort Monitor"]
  202-a["User Interaction Handler"]
  202-b["User Data Manager"]
end
202 --- 202-a
202 --- 202-b

Mermaid 2;

graph TB
subgraph 204["Interface Modifier"]
  204-a["Speed Adjuster"]
  204-b["Rotation Calibrator"]
  204-c["Position Regulator"]
end
204 --- 204-a
204 --- 204-b
204 --- 204-c

Output of this step in the following format: ==Fig. 2A_mermaid==, ==Fig. 2B_mermaid==, ==Fig. 2C_mermaid== and so on \n Step 29, Step 30 ' WHERE "prompt_seq_id"=192;

UPDATE "prompt"."prompt_seq" SET "instructions"='Step 25: Identify if ==Steps_sub-steps== contains sub-steps. If it does not contain sub-steps, do not perform Steps 26 to Step 28. Print the following output: ==No== if no sub-steps identified, ==Yes== if sub-steps are identified. Step 26: Split the mermaid from Step 19 into multiple mermaids based on the sub-steps grouping where each sub-step group contains a step and it''s respective sub-step from ==Steps_sub-steps==. For any step with sub-step from ==Steps_sub-steps==, ensure that the mermaid is made only for the step and all it''s sub-steps. While generating output for this step, avoid mermaids for the steps that do not contain any sub-steps. Ensure each of the mermaid splits are meaningful in context of ==Steps_sub-steps== and ==Decision_step==.

Sample Mermaid:
graph TB
100["Determine an initial eye strain context for a user wearing a VR headset."]
102{"Recognize a User Interface (UI) adaptation."}
104["Establish the intensity of the UI adaptation."]
106["Display modified VR content by applying the identified UI adaptation."]
108["Assess an updated eye strain context."]
110{"If the updated eye strain context indicates a decrease in eye strain."}
112["Modify the priority weight for the UI adaptation."]
114["Refresh a user''s profile with the UI adaptation, its intensity, and the modified priority weight."]
100 --> 102
102 -- Yes --> 104
104 --> 106
106 --> 108
108 --> 110
110 -- Yes --> 112
112 --> 114
110 -- No --> 102

Output of this step in the following format: ==Fig. 1A_mermaid==, ==Fig. 1B_mermaid==, ==Fig. 1C_mermaid== and so on. \n Step 25, Step 26' WHERE "prompt_seq_id"=150;

UPDATE "prompt"."prompt_seq" SET "fun_def"='{
    "name": "generate_multiple_mermaid",
    "description": "output of Step 29 and Step 30",
    
    "parameters": {
        "type": "object",
        "properties": {
        "is_have_sub-components": {
            "type": "string",
            "description": "output from Step 29"
        },
        "mermaids": {
            "type": "array",
            "items": {
            "type": "object",
            "properties": {
                "mermaid": {
                "type": "string"
                }
            }
            },
            "description": "Split mermaid from Step 20 only if sub-components are identified in Step 29"
        }
    },
    "required": ["is_have_sub-components","mermaids"]
}
}' WHERE "prompt_seq_id"=192;

UPDATE "prompt"."prompt_seq" SET "fun_def"='{
        "name": "generate_multiple_mermaid",
        "description": "output of Step 25 and Step 26",
        "parameters": {
            "type": "object",
            "properties": {
                "is_have_sub-steps": {
                    "type": "string",
                    "description": "output from Step 25"
                },
                "mermaids": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "mermaid": {
                                "type": "string"
                            }
                        }
                    },
                    "description": "Split mermaid from Step 19 only if sub-steps are identified in Step 25"
                }
            },
            "required": ["is_have_sub-steps","mermaids"]
        }
    }' WHERE "prompt_seq_id"=150;



UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have provided you ####Claims#### and ####current invention#### 

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc.
' WHERE "prompt_seq_id" = 137;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Current Invention: ####{{invention}}#### \n\n \n\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \n\n Claims: ####{{claims}}####', "inputs" = '{"project": ["invention", "entity_actions_rewritten", "claims"]}' WHERE "prompt_seq_id" = 138;

UPDATE "prompt"."prompt_seq" SET "inputs" = '{"project": ["invention", "entity_actions_rewritten", "entity_actions_rewritten", "claims"]}' WHERE "prompt_seq_id" = 177;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have provided you ####Claims#### and ####current invention####

I have provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a system/apparatus/device/machine claim (for example product or composition or method or process) do not do anything.

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step a table format whose table name is ==component_sub-component== with 5 columns having the following headings: Component type - system/component/sub-component, system/component/sub-component name,  system/component/sub-component name, explanation, claim number' WHERE "prompt_seq_id" = 176;

UPDATE "prompt"."prompt_seq" SET "inputs" = '{"project": ["invention", "entity_actions_rewritten", "entity_generalized_rewritten", "claims"]}' WHERE "prompt_seq_id" = 177;


UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have provided you text ####Claims#### and text ####current invention#### 

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is: claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.

Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc.
' WHERE "prompt_seq_id" = 137;


DELETE FROM "prompt"."prompt_seq" WHERE "prompt_seq_id" = 227;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Perform all the steps such as step 1 to 8. 

Step 1: Segregate the above ####claims#### into independent and dependent claims. Do not print output for this step. 

Step 2: Segregate the independent claims and claims dependent on it into their constituent types - method claims, system claims, product claims, composition claims etc. based on the claim preamble. Print output in the following format: Claim type 1 -> claim numbers, claim type 2-> claim numbers etc. 

Step 3: Find all the entities for all the claims  identified in the output of Step 2. Print output in the following format: Claim 1-> Entities, Claim 2-> entities etc. Ensure that the entities are identified in all the claims from Step 2. 

Step 3.1: Re-run step 3 if all the entities are are not identified in all the claims from step 2. Do not print output for this step. 

Step 4: Identify all the entity actions for all of the entities identified from the output of Step 3 for the respective claim types determined in Step 2. Print the output in the following format: Claim number: Entity 1 - Entity action 1 , Entity 2 - Entity action 2
Claim number: Entity 1 - entity action 1, Entity 2 - entity action 2 etc.  Ensure all the entity actions for all the entities from Step 3 are identified. 

Step 5: Identify all the entities from the text ####current invention####. 

Step 6: Identify all the entity actions from text ####current invention#### for all of the entities identified in the output of step 5. 

Step 7: co-relate all the entity actions for all the claims referenced in output of Step 4 with entity actions from text ####current invention#### identified in Step 6.  This is basically reverse mapping claim language of the entity actions with the specific description of the entity actions as given in the text ####current invention####. Print the output of this step in the following format: ==entity_actions_rewritten== Claim number: entity 1 - entity action 1 - entity action current invention, entity 2- entity action 2 - entity action current invention, Claim number: entity 1 - entity action 1 - entity action current invention, entity 2- entity action 2 - entity action current invention etc. 

Step 8: Co-relate all the entities from all the claims from Step 3  with with entities from text ####current invention#### from Step 5. This is basically reverse mapping claimed entities with specific entities given in the text ####current invention####. Print the output of this step in the following format: ==entity_generalized_rewritten== Claim 1: Entity 1 - Entity from text , Entity 2 - Entity from text
Claim 2: Entity 1 - entity from text, Entity 2 - entity from text etc.
' WHERE "prompt_seq_id" = 218;

UPDATE "prompt"."prompt_seq" SET "instructions"= E'Current Invention: ####{{invention}}#### \\n\\n  \\n\\n Claims: ####{{claims}}####', "inputs"='{"project":["invention","claims"]}' WHERE "prompt_seq_id"=138;
UPDATE "prompt"."prompt_seq" SET "instructions"= E'entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \\n\\n step 5', "inputs"='{"project":["entity_actions_rewritten"]}', "outputs"=NULL WHERE "prompt_seq_id"=141;

UPDATE "prompt"."prompt_seq" SET "instructions"= E'Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc.
\n entity_actions_rewritten: ####{{entity_actions_rewritten}}#### \\n\\n step 5' WHERE "prompt_seq_id"=141;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have provided you text ####Claims#### and text ####current invention#### 

I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is: claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

Step 3: If the text ####Claims#### include a method claim, then print output: @@@Yes-method-claim@@@. 

Step 4: If the text ####Claims#### include a claim that is other than a method claim (for example, system or product or composition or device or structure), do not do anything.' WHERE "prompt_seq_id"=137;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have provided you with the text ####Claims####.

Step 3: Determine if any of the independent claims from the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@.' WHERE "prompt_seq_id"=176;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

current invention: ####{{current invention}}####
entity_actions_rewritten: ####{{entity_actions_rewritten}}####



Step 5:  Identify the respective method independent claim and other claims dependent on it from the text ####Claims####. Output of this step in the following format: ==Method_claims== Claim 1, Claim 2 etc. 

step 5.1:  From the output of step 5, and using entity action from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 6: Using Step 5.1 identify all the main steps/entity actions that occur in a logical sequence to accomplish the method in context of claims from Step 5 and the ####current invention####. Using Step 5.1, for each main step/entity action, identify the sub-steps/parallel steps/entity actions that are optional/additional details for the main steps to accomplish the method in context of claims from Step 5. Ensure all the claims from Step 5 are referred in Step 6 output. Number the step and sub-step, in an even numbering series with increment of 2 for each step, as follows - if step number is 100, it''s sub-step number will be 100-a, 100-b, for step 102 the sub-step will be 102-a, 102-b etc. Output of this step in the following format: ==Steps_sub-steps== 100 -> explanation  -> claim number, 100-a -> explanation -> claim number etc.

Step 5
' WHERE "prompt_seq_id"=141;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have also provided a mapping between the entities in claims, entity action from claims mapped to the entity actions in text ####current invention#### in text ####entity_actions_rewritten####. Format for this mapping is claim 1: Entity action in claims-entity action from current invention, claim 2: Entity action in claims-entity action from current invention etc. 

I have also provided you mapping between entities from Claims and entities from text ####current invention#### in text  ####entity_generalized_rewritten####. Format for the mapping is: Claim 1: entity from claim - entity from text####current invention####

current invention: ####{{current invention}}####
entity_actions_rewritten: ####{{entity_actions_rewritten}}####
entity_generalized_rewritten: ####{{entity_generalized_rewritten}}####

Step 5:  Identify the respective system/apparatus/device/machine independent claim and other claims dependent on it from the text ####Claims####. Print the claim numbers only.

step 5.1:  From the output of step 5, and using specific entity action associated with ####current invention#### from text ####entity_actions_rewritten####, identify which dependent claim depends on which entity action of the independent claim or the entity action in other dependent claims. Provide the mapping between the dependent claims and the claim entity actions of the independent claim or the entity actions of other dependent claims on which it depends. Output - Independent claim/dependent claim - dependent claim - reason etc. 

Step 5.2: Identify and name the system that encompasses the specific entity actions associated with ####current invention#### from text ####entity_actions_rewritten#### and all the claims from Step 5.      

Step 5.3: Identify all the specific entities from all the claims from Step 5 using the mapping between generalised entities and specific entities from ####entity_generalized_rewritten#### Output: - Claim - Entities

Step 5.4: Group all the entities from output of Step 5.3 using overlaps/commonalities in their entity action from text ####entity_actions_rewritten#### into unique components and sub-components. The grouping into unique components and sub-components should be based on the overlap of entity actions by/of all the entities from output of Step 5.3 using text ####entity_actions_rewritten #### and output from Step 5.1. Remember, entities from Step 5.3 maybe referred by different names in claims but may refer to the same entity - this can be determined using overlap/commonalities between the entity actions of all the entities from text ####entity_actions_rewritten####. Ensure all the entities from all the claims from Step 5.3 are referred in the output. Output of this step in the following format:==component_entities== Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc. 

Step 5.5 - Ensure all the entities from all the claims from Step 5.3 are used in the grouping of components and sub-components in Step 5.4 and referred in the output from Step 5.4. 


Step 5.6 : Check the naming of components from Step 5.4 to determine which components are named like method components. Re-name only the components and sub-components from output of Step 5.4 to sound like system components if they sound like method components. When renaming, ensure the names are small/pithy/catchy titles with at most 2-5 words. Ensure the new names are unique and capture the essence of the component and sub-component entity action as mapped in output of Step 5.5

Step 5.7: Number the system, component and sub-component from the output of step 5.2 and step 5.6, in an even numbering series with increment of 2 for each component as follows - if the system is numbered 200, the component should be numbered 202 and it''s sub-component should be numbered 202-a, 202-b etc. The next component will be numbered 204 and it’s sub-component will be numbered 204-a, 204-b etc. Print the output of this step a table format whose table name is ==component_sub-component== with 5 columns having the following headings: Component type - system/component/sub-component, system/component/sub-component name,  system/component/sub-component name, explanation, claim number

Step 5', "inputs"='{"project":["invention","entity_actions_rewritten","entity_generalized_rewritten"]}' WHERE "prompt_seq_id"=180;

UPDATE "prompt"."prompt_seq" SET "inputs"='{"project":["claims"]}' WHERE "prompt_seq_id"=177;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'Claims: ####{{claims}}#### ' WHERE "prompt_seq_id" = 177;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have provided you with the text ####Claims####. \n Step 3: Using the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a method claim. If any independent claim is a method claim, then print output: @@@Yes-method-claim@@@.' WHERE "prompt_seq_id"=137 ;
UPDATE "prompt"."prompt_seq" SET "instructions"='Claims: ####{{claims}}#### ' WHERE "prompt_seq_id"=177 ;
UPDATE "prompt"."prompt_seq" SET "instructions"='I have provided you with the text ####Claims####.


Using the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a method claim. If any independent claim is a method claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@.' WHERE "prompt_seq_id"=176 ;
UPDATE "prompt"."prompt_seq" SET "instructions"='Claims: ####{{claims}}####' WHERE "prompt_seq_id"=138;

UPDATE "prompt"."prompt_seq" SET "instructions"='I have provided you with the text ####Claims####.


Using the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a method claim. If any independent claim is a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@.' WHERE "prompt_seq_id"=176;

UPDATE "prompt"."prompt_seq" SET "instructions"= E'I have provided you with the text ####Claims####. \\\\\\\\n Step 3: Use the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a method claim. Output format: @@@Yes-method-claim@@@.' WHERE "prompt_seq_id"=137 ;

UPDATE "prompt"."prompt_seq" SET "instructions" = 'I have provided you with the text ####Claims####.


Using the preamble of the independent claims, determine if any of the independent claims from the text ####Claims#### include a system/apparatus/device/machine claim, then print output: @@@Yes-system/apparatus/device/machine-claim@@@.' WHERE "prompt_seq_id" = 176;

UPDATE "prompt"."prompt_seq" SET "model"='gpt-4-1106-preview' WHERE "prompt_seq_id"=265 OR "prompt_seq_id"=266;