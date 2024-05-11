FROM python:3.11-slim-buster


# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000


ENV FLASK_APP=app.py
ENV FLASK_ENV=development

#RUN chmod +x ./entrypoint.sh

#ENTRYPOINT ["./entrypoint.sh"]


#CMD ["flask", "run", "--host=0.0.0.0", "--port=5002"]
CMD ["python3", "app.py"]