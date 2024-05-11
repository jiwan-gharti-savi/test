CREATE TABLE "project"."figures" (
    "fig_id" serial PRIMARY KEY,
    "name" character varying(100),
    "summary" text,
    "brief_description" text,
    "is_selected" boolean DEFAULT false,
    "is_deleted" boolean DEFAULT false,
    "access_level" text,
    "detailed_description" text,
    "domain" character varying(50),
    "sysuser_id" integer,
    "project_id" integer,
    "base64_image" bytea,
    "modified_at" timestamp with time zone DEFAULT now(),
    "created_at" timestamp with time zone DEFAULT now()
);

ALTER TABLE "project"."figures_section_history"
ADD COLUMN "user_figures" jsonb;

ALTER TABLE "project"."project_history"
ADD COLUMN "filters" jsonb DEFAULT '{}';

INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected", "parent_prompt_id", "created_at", "modified_at") VALUES
(31, 'block_diagram_description_with_figures', 'V1', 't', NULL, NULL, NULL);
INSERT INTO "prompt"."prompt" ("prompt_id", "name", "version", "is_selected", "parent_prompt_id", "created_at", "modified_at") VALUES
(32, 'flowchart_description_with_figures', 'V1', 't', NULL, NULL, NULL);

DELETE FROM prompt.prompt_seq where prompt_id = 31;

INSERT INTO "prompt"."prompt_seq" ("prompt_seq_id", "seq", "prompt_id", "short_name", "role", "instructions", "fun_def", "inputs", "outputs", "created_at", "modified_at", "repeat", "is_stream") VALUES
(248, 12, 31, 'block_diagram_description_with_figures', 'user', 'System and all main components from step 5.7', '{
    "name": "generate_all_step_titles",
    "parameters": {
        "type": "object",
        "properties": {
            "steps": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "step_num": {
                            "type": "number"
                        }
                    }
                },
                "description": "generate all step number from output. Starting step number start from 200."
            }
        }
    }
}', NULL, '{"project": ["steps"]}', NULL, NULL, NULL, NULL),
(249, 13, 31, 'block_diagram_description_with_figures', 'user', 'Step 5.8: Co-relate all the entities from Step 5.5 with the renamed and numbered components and sub-components from Step 5.7. Output format: Component 1 - all entities for component 1 -claim numbers, sub-component 1 for component 1- all entities for sub-component 1 - claim numbers, sub-component 2 for component 1 - all entities for sub-component 2 - claim numbers etc., Component 2- all entities for component 2 - claim numbers, sub-component 1 for component 2- all entities for sub-component 1 - claim numbers, sub-component 2 for component 2 - all entities for sub-component 2 - claim numbers etc.   Output of Step 5.8:', '', NULL, '{"project": []}', NULL, NULL, NULL, NULL),
(250, 14, 31, 'block_diagram_description_with_figures', 'user', 'Step 12: Our goal is to Co-relate all the specific entity actions associated with ####current invention#### in all the claims from text ####entity_actions_rewritten #### with all the components from Step 5.8. Ensure all entity actions from text ####entity_actions_rewritten#### are co-related with all the components from Step 5.8 and all the components numbers are mentioned in the output. For every entity action, also extract the mathematical construct or parameters or metrics/measurements associated with it from text ####current invention####. For all entity actions from text ####entity_actions_rewritten #### also extract all the definitions/explanations of every technical term in the entity action from text ####current invention####. Output - Claim 1:- entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, all entity action details/definitions/parameters, entities, components etc. Claim 2 : entity action 1, all entity action details/definitions/parameters, entities, components, entity action 2, entity action entity action 1, all entity action details/definitions/parameters, entities, components etc and so on for every claim.

Step 13: Ensure all the components from Step 5.8  are referenced in the output from Step 12. Do not ignore any component from from Step 5.8 in the output from Step 12. Do not repeat the step instructions in the output. 

Step 14: Our goal is to co-relate all the alternative entities from text ####alternatives for each entity#### and ####entity_generalized_rewritten#### with all the components from Step 5.8. Ensure all the alternative entities from text ####alternatives for each entity#### are co-related with all components from Step 5.8 alongwith all the details. Output format –  component 200 -> alternatives, Component 202 ->  alternatives , entity 3 - alternatives etc.    

Step 15: co-relate all the entities from text ####entity_generalized_rewritten#### and ####alternatives for each entity#### with all the components identified from Step 5.8 and provide all the details. Do not ignore any entity from ####entity_generalized_rewritten####. Output format - Entity 1- alternatives - component 200, Entity 2- alternatives - component 202 etc. 

Step 16: Ensure all the entities from text #### entity_generalized_rewritten#### are co-related with steps from Step 5.8 in Step 15. Do not print output for this step.  Output of Step 12 and Step 13:', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL),
(252, 15, 31, 'block_diagram_description_with_figures', 'user', 'step 14', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL),
(253, 16, 31, 'block_diagram_description_with_figures', 'user', 'step 15 and step 16', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL),
(254, 17, 31, 'block_diagram_description_with_figures', 'user', '####text 1#### is in the format [Figure] ####content####

Text 1
{{user_figures_text}}', NULL, '{"project": ["user_figures_text"]}', NULL, NULL, NULL, NULL, NULL),
(255, 18, 31, 'block_diagram_description_with_figures', 'user', 'Step 17: Identify the specific component or sub-component and their respective reference numbers from the output of step 12 that is closely associated with the input ####text 1####. Provide the reference number and name of the associated component from ####text 1#### also for each Figure. ', NULL, NULL, '{"project": []}', NULL, NULL, NULL, NULL),
(256, 19, 31, 'block_diagram_description_with_figures', 'user', 'from Step 17 output, make json as with fields 
componenet: componenet or sub-componenet from Step 12
FIG: from the ####text 1####
reference number: from the ####text 1####
reference name: from the ####text 1####  ', '{
    "name": "generate_component_reference_relation",
    "description": "generate all component vs reference number relations",
    "parameters": {
      "type": "object",
      "properties": {
        "component_references": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "component": {
                "type": "number"
              },
              "fig": {
                "type": "string"
              },
              "ref_num": {
                "type": "string"
              },
              "ref_name": {
                "type": "string"
              }
            },
            "required": [
              "component",
              "fig",
              "ref_num",
              "ref_name"
            ]
          }
        },
        "total_component_references": {
          "type": "number"
        }
      },
      "required": [
        "component_references",
        "total_component_references"
      ]
    }
  }
  ', NULL, '{"project": ["component_references"]}', NULL, NULL, NULL, NULL),
(257, 20, 31, 'block_diagram_description_with_figures', 'user', 'Choose the component {{step_num}} and its sub-components from Step 5.8.  The explanation should be structured as follows, with each section addressing the specific points mentioned:

==Introduction_{{step_num}}==
Briefly introduce the component and its significance in the context of its application.
==Component_and_sub-component_overview_{{step_num}}== Component and sub-component Overview (Referencing Step 5.8 , Step 17):
Reference, define, and explain all the entities that comprise this component and sub-component, focusing on their characteristics, roles, and how they contribute to the component''s function. Include mentions of associated devices/components for the associated component or sub-component from Step 17 respectively along with their respective reference number as associated component or sub-component ( reference number ). 

Number all the components and sub-components from Step 5.8 in the explanation. Do not refer to the words like "entity", "entities", "claim", "crucial" etc. in the explanation.  Write the output of ==Introduction_{{step_num}}==, ==Component_and_sub-component_overview_{{step_num}}==', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": []}', NULL, NULL, 'Start', NULL),
(258, 21, 31, 'block_diagram_description_with_figures', 'user', 'Explain the Working of the {{step_num}} component and sub-component above (Referencing Step 12, Step 5.8, Step 17):
Reference, define and Describe in detail all the entity actions associated with all the entities of the chosen component and its sub-components, as mapped in Step 12.  (do not refer to the entity action explicitly). 
For each entity action, explain its nature (what), purpose (why), context (when and under what conditions), and method (how).
Please ensure that the working/entity actions of the component and sub-component is structured coherently, with each entity action explanation flowing logically into the next. The language should be technical yet clear, catering to a professional audience with the aim of providing a thorough understanding of the component''s workings. 
Use your knowledge base to include any implicit entities, components, actions, or details not explicitly mentioned in Step 12 but crucial for a complete understanding of the entity actions and how they flow logically into one another for the working of the system. 

Number the components and sub-components from Step 5.8 in the explanation. Do not number entities or refer to words like "entity", "entities", "entity action", "crucial", "critical" etc. 

Do not repeat anything from the explanation that explains the entities comprising the component and sub-component from above. ==explanation_{{step_num}}==  Write the output of ==explanation_{{step_num}}==  in 150 words', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": []}', NULL, NULL, '', NULL),
(259, 22, 31, 'block_diagram_description_with_figures', 'user', 'Combine the Introduction_{{step_num}}, Component_and_sub-component_overview_{{step_num}} and explanation_{{step_num}} of component {{step_num}}.   Revise by removing the adjectives/superlatives for all the entities and their actions. Remove patent profanity terms  like "invention", "entity", "entities", "alternative of each entity", "laymen", "implicit component", "technical write-up" and "entity action", "real-world" etc. Also, remove superlatives like "critical", "most important", "crucial", "important"etc. Our goal is only to state facts about the component/sub-component and it''s working, it''s real world manifestation and not use any adjectives/language that deviates from that goal. Do not use titles like "Introduction" and "component and sub-component overview" etc. in the output. Write the output in a multiple paragraphs without remove reference figures and componenets format to improve user readability. ', NULL, '{"project": ["flowchart_main_element_nums"]}', '{"project": ["block_diagram_description"]}', NULL, NULL, 'End', 't');
