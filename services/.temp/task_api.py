# @celery_queue_api_blueprint.route("/project/task/<api_name>", methods=['POST'])
# def separate_section_task_caller(
#     api_name: str
# ):
#     """
#     trigger a separate streaming task based on section_type
#
#     project_id: query_param, required, project uuid.
#
#     body:
#         body:
#         project_id: str = None
#         query_type: str
#         section_type: SectionTypesEnum
#         retry: bool = False
#
#     """
#     #
#     # try:
#     #     data = request.get_json()
#     #     validated_data = SectionTypeFetchModel(**data)
#     # except ValidationError as e:
#     #     return pydantic_validation_errors(e)
#
#     data = request.get_json()
#     user_data = data
#
#     project_id = data.get('project_id')
#     db_operation = DBOperation()
#     row = db_operation.select_project_status_row(
#         project_id=user_data['project_id'],
#         api_name=api_name,
#         section_history_id=user_data.get('section_history_id')
#     )
#     print("project api status row ", len(row))
#
#     if row and row[0].get("status") == "PENDING":
#         # check any subtask is in queue.
#         status = check_sub_task_is_in_queue(
#             project_id=project_id,
#             section_history_id=user_data.get('section_history_id'),
#             api_name=api_name,
#         )
#         if status:
#             return {"status": "success", "message": "task is in queue."}
#         else:
#             # update database and marked as error
#             status = confirm_api_task_is_success_or_failure(
#                 project_id=project_id,
#                 section_history_id=user_data.get('section_history_id'),
#                 api_name=api_name,
#             )
#             if status == "SUCCESS":
#                 return {"status": "SUCCESS", "message": "task is already completed."}
#
#             elif status == 'FAILURE':
#                 all_inputs = list(user_data.keys())
#                 all_inputs.append("invention")
#                 if api_name in ["regenerate_claim_api"]:
#                     all_inputs.append("claims")
#                 # else:
#                 # call task
#                 celery_task.delay(
#                     api_name=api_name,
#                     inputs=all_inputs,
#                     project_id=project_id,
#                     user_data=user_data
#                 )
#                 # crate a row
#                 row = db_operation.create_project_task_status_row(
#                     api_name=api_name,
#                     section_history_id=user_data.get("section_history_id"),
#                     project_id=user_data.get("project_id"),
#                     status="PENDING",
#                     sysuser_id=user_data.get("sysuser_id"),
#                     estimated_time=0
#                 )
#
#                 return {
#                     "status": "success",
#                     "message": "task is queued."
#                 }
#
#
#
#     elif row and row[0].get("status") == "SUCCESS":
#         return {"status": "success", "message": "task is completed."}
#
#     elif (row and row[0].get("status") == "ERROR") or not row:
#
#         all_inputs = list(user_data.keys())
#         all_inputs.append("invention")
#         if api_name in ["regenerate_claim_api"]:
#             all_inputs.append("claims")
#         # else:
#             # call task
#         celery_task.delay(
#             api_name=api_name,
#             inputs=all_inputs,
#             project_id=project_id,
#             user_data=user_data
#         )
#
#
#         # crate a row
#         row = db_operation.create_project_task_status_row(
#             api_name= api_name,
#             section_history_id = user_data.get("section_history_id"),
#             project_id= user_data.get("project_id"),
#             status= "PENDING",
#             sysuser_id= user_data.get("sysuser_id"),
#             estimated_time= 0
#         )
#
#         return {
#             "status": "success",
#             "message": "task is queued."
#         }