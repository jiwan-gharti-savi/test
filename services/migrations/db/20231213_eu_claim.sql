INSERT INTO "prompt"."prompt"("prompt_id","name","version","is_selected","parent_prompt_id","created_at","modified_at")
VALUES
(30,E'claims_eu',E'V1',TRUE,NULL,NULL,NULL);


ALTER TABLE "project"."project_history"
ADD COLUMN "claims_style" varchar(32) DEFAULT 'us';

ALTER TABLE "project"."project"
ADD COLUMN "claims_style" varchar(32) DEFAULT 'us';

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream") VALUES
(241, 1, 30, 'claims_europe', 'system', 'I will provide you ####current invention####. Please write the claims for the current invention according to the instructions given below:

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

', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(242, 2, 30, 'claims_europe_invention_input', 'user', 'current invention: ####{{invention}}####', '{
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
        "required": [
            "entities",
            "specific_attributes",
            "entities_with_sequence",
            "entities_without_sequence",
            "entity_generalised",
            "entity_generalised_sequence",
            "entity_attributes",
            "entity_generalised_actions",
            "novelty",
            "necessary_features",
            "optional_features"
        ]
    },
    "description": "Get all intermediate results of the Claims for Step 1 to Step 6"
}', '{"project": ["invention"]}', '{"project": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes", "entity_generalised_actions", "novelty", "necessary_features", "optional_features"]}', NULL, NULL, NULL, NULL),
(243, 3, 30, 'claims_europe_characterising_aspect', 'user', 'Step 8: Identify/define prior art that is known or widely used in the field related to the text ####current invention####. Use the generalised language of entities from {entity_generalised} or {entity_generalised_sequence} to describe the prior art. Output: ==pre_characterising_aspect==

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
}', NULL, '{"project": ["pre_characterising_aspect", "characterising_elements"]}', NULL, NULL, NULL, NULL),
(244, 4, 30, 'claims_europe_independent', 'user', 'Step 9: You are a European patent attorney. Your aim is to draft patent claims for text ####current invention #### by following Steps. When drafting claims, use the generalised language for all entities from {entities_generalised} and generalised language for entity actions from {entity_generalised_actions} without being vague. When writing a claim it is important to describe how the various entities are structured and how the various entities interact and connect.

Step 10: Draft one 2 part independent patent claim suitable for filing a patent application with the European patent office for a method/system/ process/ apparatus/machine/device/product/composition etc in context of the invention from ####current invention####. Using the {pre_characterising_aspect}, please draft the preamble of the two-part European patent independent claim. This preamble should succinctly summarise the known features or state of the art relevant to the invention. Then, using the characterising aspects of the invention from {characterising_elements}, draft the characterising portion of the claim. The characterising portion should clearly specify the novel features of the invention that distinguish it from the prior art and contribute to solving the technical problem. Ensure that the claim is structured to highlight the inventive step and aligns with the requirements of the European Patent Office. Do not use the any sub-titles in the claim draft. No explicit reference like previously known as is allowed. Pring Output in this format: ==independent_claim==

Step 12: Ensure that the independent claims from {independent_claims} are truly independent and not dependent on other claims. It is not allowed for Independent claims to reference any other claims. Do not print output for this step. 

Step 13: Ensure the {independent_claims} do not use phrases like "previously known"/ "pre-characterising", "characterising" aspects, etc. for entities or entity actions anywhere in the claims.  Do not print output for this step.   Step 13.1 Use the formatting style of following ####sample claim#### to modify the format of the claims generated in step 10 (format independent claims where one element is below the other element and avoid spacing between the elements of that claim). Print the formatted claims. Do not print step number   Sample claim:
####{{claim_eu_template}}####
', NULL, '{"template": ["claim_eu_template"]}', NULL, NULL, NULL, NULL, NULL),
(246, 5, 30, 'claims_europe_independent', 'user', 'Step 10, Step 12, Step 13', '{
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
}', NULL, '{"project": ["independent_claims"]}', NULL, NULL, NULL, NULL),
(247, 8, 30, 'claims_europe_dependent', 'user', 'Step 14: Use {entity_attributes} for defining the borders of the invention with detailing and specificity by adding dependent claims. The dependent claims must specify all the specific attributes and specific entity forms/names for all generalised entities from {entity_generalised} referenced in the independent claims from {independent_claims}. {entity_attributes} stores the mapping between generalised entity from {entity_generalised} with it''s respective attributes from {specific_attributes} and specific entity form/name from {entities}. The dependent claims should not repeat/recite entity attributes/features already mentioned in the independent claims. 

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
}', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't');




INSERT INTO "prompt"."templates" ("template_id", "name", "value") VALUES (2, 'claim_eu_template', '1. A computer-implemented method for personalized adaptation of immersive content, the method comprising:

- determining an initial user comfort context for a user interacting with immersive content through an immersive device,
- identifying a user experience adaptation and its associated intensity based on the initial user comfort context,
- rendering modified immersive content by applying the identified user experience adaptation,

characterized by:

- applying the user experience adaptation selected from a group consisting of object motion adaptation, object orientation adaptation, and object placement adaptation,
- determining an updated user comfort context after the user has interacted with the modified immersive content,
- adjusting a priority weight for the identified user experience adaptation based on the updated user comfort context, wherein the priority weight is increased if the updated user comfort context indicates improved user comfort,
- saving the identified user experience adaptation, its associated intensity, and the adjusted priority weight in a user profile for future use.');
