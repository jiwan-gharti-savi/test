DELETE FROM "auth"."privilege" WHERE "id" = 1 OR "id" = 2 OR "id" = 3 OR "id" = 4 OR "id" = 5 OR "id" = 6;

DELETE FROM "auth"."sysrole" WHERE "id" = 1 OR "id" = 2 OR "id" = 3 OR "id" = 4 OR "id" = 5 OR "id" = 6;

DELETE FROM "auth"."role_privilege" WHERE ("role_id" = 1 AND "privilege_id" = 1) OR ("role_id" = 2 AND "privilege_id" = 1) OR ("role_id" = 2 AND "privilege_id" = 2);

delete from auth.sysrole;
delete from auth.privilege;
delete from auth.role_privilege;

DELETE FROM auth.sysrole WHERE id in (1, 2, 3, 4);


INSERT INTO "auth"."sysrole"("id","name","modified_at","created_at")
VALUES
(1,E'inventor',E'2024-04-30',E'2024-04-30'),
(2,E'attorney',E'2024-04-30',E'2024-04-30'),
(3,E'portfolio_manager',E'2024-04-30',E'2024-04-30'),
(4,E'search',E'2024-04-30',E'2024-04-30'),
(5,E'search_masked',E'2024-05-05',E'2024-05-05');


ALTER TABLE "auth"."privilege"
ADD COLUMN "tool" varchar
(255);

DELETE FROM "auth"."privilege" WHERE "id" in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21);


INSERT INTO "auth"."privilege"("id","name","modified_at","created_at","tool")
VALUES
(1,E'drafting_draft_claim',E'2024-04-30',E'2024-04-30',E'drafting'),
(2,E'prior_art_explore',E'2024-04-30',E'2024-04-30',E'prior-art'),
(3,E'prior_art_masked',E'2024-04-30',E'2024-04-30',E'prior-art'),
(4,E'drafting_view_prior_art',E'2024-04-30',E'2024-04-30',E'drafting'),
(5,E'drafting_view_specs',E'2024-04-30',E'2024-04-30',E'drafting'),
(6,E'drafting_edit_specs',E'2024-04-30',E'2024-04-30',E'drafting'),
(7,E'drafting_view_claim',E'2024-04-30',E'2024-04-30',E'drafting'),
(8,E'drafting_prompt_specs',E'2024-04-30',E'2024-04-30',E'drafting'),
(9,E'drafting_edit_title',E'2024-04-30',E'2024-04-30',E'drafting'),
(10,E'drafting_edit_abstract',E'2024-04-30',E'2024-04-30',E'drafting'),
(11,E'drafting_edit_technical_field',E'2024-04-30',E'2024-04-30',E'drafting'),
(12,E'drafting_edit_background',E'2024-04-30',E'2024-04-30',E'drafting'),
(13,E'drafting_edit_summary',E'2024-04-30',E'2024-04-30',E'drafting'),
(14,E'drafting_edit_claim',E'2024-04-30',E'2024-04-30',E'drafting'),
(15,E'drafting_prompt_title',E'2024-04-30',E'2024-04-30',E'drafting'),
(16,E'drafting_prompt_abstract',E'2024-04-30',E'2024-04-30',E'drafting'),
(17,E'drafting_prompt_technical_field',E'2024-04-30',E'2024-04-30',E'drafting'),
(18,E'drafting_prompt_background',E'2024-04-30',E'2024-04-30',E'drafting'),
(19,E'drafting_prompt_summary',E'2024-04-30',E'2024-04-30',E'drafting'),
(20,E'drafting_prompt_claim',E'2024-04-30',E'2024-04-30',E'drafting'),
(21,E'invention_interview',E'2024-04-30',E'2024-04-30',E'idf'),
(22,E'prior_art_view',E'2024-05-05',E'2024-05-05',E'prior_art');


DELETE FROM "auth"."role_privilege" WHERE "role_id" in (1, 2, 3, 4);

INSERT INTO "auth"."role_privilege"("role_id","privilege_id","is_enabled","modified_at","created_at")
VALUES
(2,1,TRUE,E'2024-04-30',E'2024-04-30'),
(3,1,TRUE,E'2024-04-30',E'2024-04-30'),
(2,2,TRUE,E'2024-04-30',E'2024-04-30'),
(3,2,TRUE,E'2024-04-30',E'2024-04-30'),
(4,2,TRUE,E'2024-04-30',E'2024-04-30'),
(5,2,TRUE,E'2024-05-05',E'2024-05-05'),
(2,3,TRUE,E'2024-04-30',E'2024-04-30'),
(4,3,TRUE,E'2024-05-05',E'2024-05-05'),
(2,4,TRUE,E'2024-04-30',E'2024-04-30'),
(3,4,TRUE,E'2024-04-30',E'2024-04-30'),
(2,5,TRUE,E'2024-04-30',E'2024-04-30'),
(3,5,TRUE,E'2024-04-30',E'2024-04-30'),
(2,6,TRUE,E'2024-04-30',E'2024-04-30'),
(3,6,TRUE,E'2024-04-30',E'2024-04-30'),
(2,7,TRUE,E'2024-04-30',E'2024-04-30'),
(3,7,TRUE,E'2024-04-30',E'2024-04-30'),
(2,8,TRUE,E'2024-04-30',E'2024-04-30'),
(3,8,TRUE,E'2024-04-30',E'2024-04-30'),
(2,9,TRUE,E'2024-04-30',E'2024-04-30'),
(3,9,TRUE,E'2024-04-30',E'2024-04-30'),
(2,10,TRUE,E'2024-04-30',E'2024-04-30'),
(3,10,TRUE,E'2024-04-30',E'2024-04-30'),
(2,11,TRUE,E'2024-04-30',E'2024-04-30'),
(3,11,TRUE,E'2024-04-30',E'2024-04-30'),
(2,12,TRUE,E'2024-04-30',E'2024-04-30'),
(3,12,TRUE,E'2024-04-30',E'2024-04-30'),
(2,13,TRUE,E'2024-04-30',E'2024-04-30'),
(3,13,TRUE,E'2024-04-30',E'2024-04-30'),
(2,14,TRUE,E'2024-04-30',E'2024-04-30'),
(3,14,TRUE,E'2024-04-30',E'2024-04-30'),
(2,15,TRUE,E'2024-04-30',E'2024-04-30'),
(3,15,TRUE,E'2024-04-30',E'2024-04-30'),
(2,16,TRUE,E'2024-04-30',E'2024-04-30'),
(3,16,TRUE,E'2024-04-30',E'2024-04-30'),
(2,17,TRUE,E'2024-04-30',E'2024-04-30'),
(3,17,TRUE,E'2024-04-30',E'2024-04-30'),
(2,18,TRUE,E'2024-04-30',E'2024-04-30'),
(3,18,TRUE,E'2024-04-30',E'2024-04-30'),
(2,19,TRUE,E'2024-04-30',E'2024-04-30'),
(3,19,TRUE,E'2024-04-30',E'2024-04-30'),
(2,20,TRUE,E'2024-04-30',E'2024-04-30'),
(3,20,TRUE,E'2024-04-30',E'2024-04-30'),
(1,21,TRUE,E'2024-04-30',E'2024-04-30'),
(2,21,TRUE,E'2024-04-30',E'2024-04-30'),
(3,21,TRUE,E'2024-04-30',E'2024-04-30'),
(2,22,TRUE,E'2024-05-05',E'2024-05-05'),
(3,22,TRUE,E'2024-05-05',E'2024-05-05'),
(4,22,TRUE,E'2024-05-05',E'2024-05-05'),
(5,22,TRUE,E'2024-05-05',E'2024-05-05');



-- INSERT INTO "auth"."sysrole"("id","name","modified_at","created_at")
-- VALUES
-- (1,E'inventor',E'2024-04-30',E'2024-04-30'),
-- (2,E'attorney',E'2024-04-30',E'2024-04-30'),
-- (3,E'portfolio_manager',E'2024-04-30',E'2024-04-30'),
-- (4,E'search',E'2024-04-30',E'2024-04-30'),
-- (5,E'search_masked',E'2024-05-05',E'2024-05-05');

