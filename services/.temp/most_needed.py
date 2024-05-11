# # CONFIRM ACTUAL SUCCESS OR FAILURE IS HAPPENED WITH CELERY RESULTS.
#                 if result.state == "SUCCESS" and row.get('status') != 'SUCCESS':
#                     # update.
#                     db.execute({
#                         "query": "update_sub_task_api_status_as_success",
#                         "values": {
#                             "sub_task_id": task_id
#                         }
#                     })
#                 if result.state == 'ERROR' and row.get('status') != 'ERROR':
#                     # update.
#                     db.execute({
#                         "query": "update_sub_task_api_status_as_error",
#                         "values": {
#                             "sub_task_id": task_id
#                         }
#                     })



# def api_task_compeleted_inceptor(
#         project_id: str,
#         section_history_id: str,
#         api_name: str
# ):
    # print("inside here...")
    # any_pending_task = db.execute({
    #     'query': 'select_sub_api_task',
    #     'values': {
    #         'project_id': project_id,
    #         'section_history_id': section_history_id,
    #         'status': 'QUEUED'
    #     }
    # })
    #
    # if any_pending_task:
    #     print("pending task", any_pending_task)
    #     # NOT A LAST TASK
    #     pass
    #
    # any_error_task = db.execute({
    #     'query': 'select_sub_api_task',
    #     'values': {
    #         'project_id': project_id,
    #         'section_history_id': section_history_id,
    #         'status': 'ERROR'
    #     }
    # })
    # if any_error_task:
    #     # MARK IT AS ERROR
    #     db.execute({
    #         'query': 'update_or_insert_api_task',
    #         'values': {
    #             'project_id': project_id,
    #             'section_history_id': section_history_id,
    #             'status': 'ERROR'
    #         }
    #     })

    # if not any_pending_task and not any_error_task:
    #     print("completed.....")
    #
    #     # MARK IT AS COMPLETED.
    #     db.execute({
    #         'query': 'update_or_insert_api_task',
    #         'values': {
    #             'project_id': project_id,
    #             'api_name': api_name,
    #             'section_history_id': section_history_id,
    #             'status': 'SUCCESS'
    #         }
    #     })
    #
    # return True


# def post(self, api_name: str, user_data: dict):
#     project_id = user_data.get('project_id')
#     section_history_id = user_data.get('section_history_id')
#     all_inputs = list(user_data.keys())
#     all_inputs.append("invention")
#     if api_name in ["regenerate_claim_api"]:
#         all_inputs.append("claims")
#
#     print("all_inputs: ", all_inputs)
#     rows = self.list_sub_api_task(project_id, api_name, section_history_id)
#     sub_task_status = [each.get('status') for each in rows]
#     if not sub_task_status:
#         print("first time called.....")
#         _ = self.make_all_sub_api_as_queued(project_id, api_name, section_history_id)
#         celery_task.delay(
#             api_name=api_name,
#             inputs=all_inputs,
#             project_id=project_id,
#             user_data=user_data
#         )
#         return {
#             "status": TaskStatusEnum.QUEUED,
#             "message": "Task is Queued."
#         }
#
#     elif any(status == TaskStatusEnum.QUEUED for status in sub_task_status):
#         print("pending..............")
#         status = self.check_sub_task_is_in_queue(project_id, section_history_id, api_name)
#         if status == TaskStatusEnum.QUEUED:
#             return {
#                 "status": "success",
#                 "message": "task is already in processing state."
#             }
#         else:
#             celery_task.delay(
#                 api_name=api_name,
#                 inputs=all_inputs,
#                 project_id=project_id,
#                 user_data=user_data
#             )
#             return {
#                 "status": TaskStatusEnum.QUEUED,
#                 "message": "task is queued."
#             }
#
#     elif all(status == TaskStatusEnum.SUCCESS for status in sub_task_status):
#         return {"status": TaskStatusEnum.SUCCESS, "message": "Task is completed."}
#
#     elif any(status == TaskStatusEnum.ERROR for status in sub_task_status):
#         print(":at least one error occurred")
#         self.mark_error_rows_to_initialize(project_id, api_name, section_history_id)
#
#         celery_task.delay(
#             api_name=api_name,
#             inputs=all_inputs,
#             project_id=project_id,
#             user_data=user_data
#         )
#         return {
#             "status": TaskStatusEnum.SUCCESS,
#             "message": "Task is Queued."
#         }
#
#     elif all(status == TaskStatusEnum.INITIALIZE for status in sub_task_status):
#         # print(":at least one error occurred")
#         # self.mark_initialize_rows_to_error(project_id, api_name, section_history_id)
#
#         celery_task.delay(
#             api_name=api_name,
#             inputs=all_inputs,
#             project_id=project_id,
#             user_data=user_data
#         )
#         return {
#             "status": TaskStatusEnum.QUEUED,
#             "message": "Task is Queued."
#         }



# def get_valid_apis(
#     project_id: str,
#     inputs: list,
#     dag_obj: DAG,
#     api: str,
#     sub_api: str,
# ) -> [list, list]:
#
#     formatted_data, prompt_data, _ = dag_obj.format_data()
#     prompt_config = prompt_data[sub_api][0]
#     already_completed_apis = db.execute({
#         'query': 'select_sub_api_task',
#         'values': {
#             'project_id': project_id,
#             'status': 'SUCCESS',
#         }
#     })
#     completed_apis = [row.get("api_sub_name") for row in already_completed_apis]
#
#     dag_data_hash = {row['api']: row for row in formatted_data}
#
#     for completed_api in completed_apis:
#         try:
#             completed_outputs = dag_data_hash[completed_api]['outputs']
#             inputs.extend(completed_outputs)
#         except Exception as e:
#             pass
#
#     selected_apis = []
#     for row in formatted_data:
#         missing_inputs = list(set(row['inputs']) - set(inputs))
#         if len(missing_inputs) == 0:
#             selected_apis.append(row['api'])
#
#     queued_apis_rows = db.execute({
#         'query': 'select_sub_api_task',
#         'values': {
#             'project_id': project_id,
#             'status': 'QUEUED',
#         }
#     })
#     queued_apis = [row.get("api_sub_name") for row in queued_apis_rows]
#
#
#     pending_apis_rows = db.execute({
#         'query': 'select_sub_api_task',
#         'values': {
#             'project_id': project_id,
#             'status': 'ERROR', # remove ERROR ONE TO REMOVE INFINITE LOOP.
#         }
#     })
#     pending_apis = [row.get("api_sub_name") for row in pending_apis_rows]
#     valid_apis = list(set(selected_apis) - set(completed_apis) - set(pending_apis) - set(queued_apis))
#     print("valid_apis====", valid_apis)
#
#     return selected_apis, valid_apis
