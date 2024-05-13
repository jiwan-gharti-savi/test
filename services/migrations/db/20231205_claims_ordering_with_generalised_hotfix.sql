DELETE FROM prompt.prompt_seq where prompt_id = 28;

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream") VALUES
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

Step 6: Identify the novelty of the invention from text ####current invention####. Identify entity actions from {entity_generalised_actions} in context of novelty that are necessary entity actions and entity actions that are optional. Print the output in the following format: ==Novelty==, ==necessary_features==, ==optional_features==', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
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
}', '{"project": ["invention"]}', '{"project": ["entities", "specific_attributes", "entities_with_sequence", "entities_without_sequence", "entity_generalised", "entity_generalised_sequence", "entity_attributes", "entity_generalised_actions", "novelty", "necessary_features", "optional_features"]}', NULL, NULL, NULL, NULL),
(215, 3, 28, 'claims', 'user', 'Step 9: You are a patent attorney. Your aim is to draft patent claims for text ####current invention#### by following Steps 10 to 29. When drafting claims, use the generalised language for all entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for entity actions from {entity_generalised_actions} without being vague. When writing a claim it is important to describe how the various entities are structured and how the various entities interact and connect.

Step 10: Draft independent claims for a method/system/ process/ apparatus/machine/device/product/composition etc. in context of novelty {novelty} using only the necessary features from {necessary_features}. Use the generalised language for entities from {entity_generalised} or {entity_generalised_sequence} and generalised language for entity actions from {entity_generalised_actions} to write all the independent claims without being vague. 

Step 11: Draft additional independent claims for larger systems, using only the necessary features from {necessary_features} that encompass the invention to enhance damages in litigation. Use the generalised language for entities from {entity_generalised} or {entity_generalised_sequence} and generalised entity actions from {entity_generalised_actions} to write all the independent claims without being vague. 

Step 12: Ensure all the independent claims are truly independent and not dependent on other claims. It is not allowed for Independent claims to reference any other claims. 

Step 13: For defining the borders of the invention with detailing and specificity, there can be the addition of dependent claims. The dependent claims must specify all the {specific_attributes} and specific entity forms/names for all generalised entities from {entity_generalised} or {entity_generalised_sequence} referenced in the independent claims using {entity_attributes}. {entity_attributes} stores the mapping between generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective attributes from {specific_attributes} and specific entity form/name from {entities}. The dependent claims should not repeat/recite entity attributes/features already mentioned in the independent claims. 

Step 14: Write additional dependent claims using the additional features/actions of entities from {optional_features} and not covered in independent claims. 

Step 16: Ensure, the dependent claims reference the relevant independent claim on which it is dependent. Ensure, dependent claims reference only one independent claim on which it is dependent. Referencing more than one independent claim is not allowed.  

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
29.12 In cases where multiple options are available, avoid the use of "or" or "and" between the options. Instead, qualify the options with "at least one a or b or c" or "one or more of a or b or c".', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
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
}', '{"template": ["claim_template"]}', '{"project": ["independent_claims"]}', NULL, NULL, NULL, NULL),
(217, 5, 28, 'claims', 'user', 'Step 40: Write all the dependent claims, following steps from Step 10 to Step 29 such that the total number of independent claims from {independent_claims} and dependent claims is 20. Do not print output for this step. 

Step 43: Using inputs from {entity_attributes},  ensure the dependent claims from Step 40 specify all the specific entities and all their corresponding specific attributes referenced in the independent claims. The dependent claims must not repeat {entity_attributes}  already mentioned in the independent claims. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 43.1: Write additional dependent claims from Step 40 to distinctly relate to an independent claim by specifying the generalised entity and its attributes from {entity_attributes} not covered from Step 43. {entity_attributes} stores the mapping between the generalised entity from {entity_generalised} or {entity_generalised_sequence} with it''s respective specific attributes from {specific_attributes} and specific entity form/name from {entities}. Do not print output for this step. 

Step 44: Add additional dependent claims from Step 40 by specifying all the optional features from {optional_features} in the dependent claims. Ensure that the dependent claim cites the optional features from {optional_features} and cites all the associated specific attributes of all the {optional_features} using the specific name/form of entities from {entity_attributes} when writing the claim. Do not print output for this step.   Step 44.1: Once all the {optional_features} and {entity_attributes}are covered in the claims from Step 40, add additional depende nt claims from by specifying features using your own knowledge base in context of the {entity_generalised_actions} and {novelty} to broaden the scope of the invention from ####current invention####. 

Step 45: Ensure none of the dependent claims from Step 40 repeat any entity action from {entity_generalised_actions} or any entity attributes/properties/quantities from {entity_attributes} mentioned in the independent claims from {independent_claims} or in other dependent claims. Do not print output for this step. 

Step 46: Ensure, all the dependent claims from Step 40 reference only one independent claim on which it is dependent. Referencing more than one independent claim is not allowed. Do not print output for this step. 

Step 47: Ensure that the dependent claims from Step 40 do not contain phrases like  ".....dependent claim.....". Do not print output for this step. 

Step 48: Ensure that the step 40 generates adequate number of dependent claims such that the total number of independent claims and dependent claims for the invention is 20. Include all the independent claims from {independent_claims} in the 20 claims. Do not print output for this step.                                          ', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(240, 6, 28, 'claims', 'user', 'Step 49: Print all the 20 claims which includes independent claims from {independent_claims} and dependent claims from output of Step 40 in the proper order by following the steps given: (a) Print any one independent claim from {independent_claims} first followed by all the dependent claims from Step 40 that depend on it before printing the next independent claim (b) Order all the dependent claims under an independent claim from Step 40 that reference other dependent claims before the next dependent claim that depends on the same independent claim (c) Number the claims in the descending order. Claims:
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
}', NULL, '{"project": ["claims"]}', NULL, NULL, NULL, 't');