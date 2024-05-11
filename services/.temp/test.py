@celery_queue_api_blueprint.route("/project/task/<api_name>", methods=['POST'])
def separate_section_task_caller(
    api_name: str
):
    """
    trigger a separate streaming task based on section_type

    project_id: query_param, required, project uuid.

    body:
        body:
        project_id: str = None
        query_type: str
        section_type: SectionTypesEnum
        retry: bool = False

    """
    #
    # try:
    #     data = request.get_json()
    #     validated_data = SectionTypeFetchModel(**data)
    # except ValidationError as e:
    #     return pydantic_validation_errors(e)

    data = request.get_json()
    user_data = data

    project_id = data.get('project_id')

    data_key = f'project:{project_id}:{api_name.lower()}:stream'
    redis_key_history = f'project:{project_id}:{api_name.lower()}:history'

    try:
        redis_conn = redis_obj.get_redis_con()
        pubsub = redis_obj.subscribe_to_channel(redis_channel=data_key)
    except Exception as e:
        logger.error(f"Cannot subscribe to redis --> {str(e)}")

    def generator(data):
        if redis_conn.exists(redis_key_history):
            existence_data = redis_conn.get(redis_key_history)
            if existence_data:
                d = existence_data.decode('utf-8')
                # d = existence_data.decode('utf-8').replace(PREFIX_GPT_CONSTANT_SEPERATOR_CONSTANT, "")
                # for message in d.split(SECTION_TYPE_SEPERATOR_CONSTANT):
                #     yield SECTION_TYPE_SEPERATOR_CONSTANT
                #     time.sleep(REDIS_BULK_SEND_SLEEP_TIMER)
                #     yield message
                #     time.sleep(REDIS_SECTION_SEND_INBETWEEN_SLEEP_TIMER)
                # yield d
                yield f"data: {d}\n\n"

            for message in pubsub.listen():
                if message['type'] == 'message':
                    yield f"data: {message['data'].decode('utf-8')}\n\n"

        else:
            try:

                    db_operation = DBOperation()
                # row = db_operation.select_project_status_row(
                #     project_id=user_data['project_id'],
                #     api_name=api_name
                # )
                # if row and row[0].get("status") == "pending":
                #     return "Task is in pending state"
                    all_inputs = list(user_data.keys())
                    all_inputs.append("invention")
                    if api_name in ["regenerate_claim_api"]:
                        all_inputs.append("claims")
                # else:
                    # call task
                    celery_task.delay(
                        api_name=api_name,
                        inputs=all_inputs,
                        project_id=project_id,
                        user_data=user_data
                    )
                    # crate a row
                    row = db_operation.create_project_task_status_row(
                        api_name= api_name,
                        section_history_id = user_data.get("section_history_id"),
                        project_id= user_data.get("project_id"),
                        status= "pending",
                        sysuser_id= user_data.get("sysuser_id"),
                        estimated_time= 0
                    )
            except Exception as e:
                print("Exception occurred", e)

            for message in pubsub.listen():
                if message['type'] == 'message':
                    data = message['data'].decode('utf-8')
                    print(data)
                    if data == "==DONE==":
                        break
                    # yield data
                    yield f"data: {data}\n\n"

    return Response(stream_with_context(generator(data)), mimetype='text/event-stream')



def _get_or_create_section_history_row(
        data,
        all_prompts,
        must_create_row=False
):


    ds = Datasource(db=db)
    prompt_config = all_prompts[0]
    prompt_section_type = prompt_config.get('name')
    if data.get('claim_section_history_id') and data.get('section_history_id') and data.get('section_type') == prompt_section_type:
        return_response_details = {
            "claim_section_history_id" : data.get('claim_section_history_id'),
            "section_history_id" : data.get('section_history_id')
        }
        print(f"return_response_details:: {return_response_details}")
        return return_response_details
    else:
        mapping_prompt_type_to_section_type = {
            "claims": "Claims",
            "regenerate_claim": "regenerate_claim"

        }
        section_type = mapping_prompt_type_to_section_type.get(prompt_section_type)
        data['section_type'] = section_type
        data['prompt_section'] = prompt_section_type

        rows = ds.db.execute({
            "query": "select_section_history",
            "values": {
                'project_id': int(data.get('project_id')),
                'section_type': 'Claims',
                'is_selected': True
            }})
        if not rows or must_create_row:
            if section_type.lower() == 'claims' or section_type.lower() =='title':
                print("section_type is ")
                ds.set_project(param=data)
                ds.create_unique_key([all_prompts])
            rows = ds.db.execute({
                "query": "select_section_history",
                "values": {
                    'project_id': int(data.get('project_id')),
                    'section_type': section_type,
                    'is_selected': True
                }})
            print(f"---rows--- {rows}")

        return_response_details = {}
        if len(rows) > 0:
            print("rows::",rows[0])
            if section_type in ['Claims']:
                return_response_details['claim_section_history_id'] = rows[0]['section_history_id']
            elif section_type in ['regenerate_claim']:
                return_response_details['regenerate_section_history_id'] = rows[0]['section_history_id']

            if data.get('section_history_id') is None:
                return_response_details['section_history_id'] = rows[0]['section_history_id']

        print(f"return_response_details:: {return_response_details}")
        return return_response_details
