import os
import re
import json
import psycopg2
import unittest
from app import app
from dotted_dict import DottedDict
from core import config
class TestBaseApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n**** Creating IPAuthor Test DB ****")
        cls._drop_db(cls)
        config.db_config["database"] = "postgres"
        # Code to create your test database
        cls.connection = psycopg2.connect(**config.db_config)
        cls.connection.autocommit = True
        cursor = cls.connection.cursor()
        cursor.execute("CREATE DATABASE ipauthor_test;")
        cursor.close()

        config.db_config["database"] = "ipauthor_test"
        # Connect to the new test database
        cls.connection = psycopg2.connect(**config.db_config)
        cls.connection.autocommit = True
        cursor = cls.connection.cursor()
        # Get list of migration files: 'migrate' is the directory containing your db_<timestamp>.sql files
        sql_files = [f for f in os.listdir('./migrations/db/')]
        
        # Sort them based on the timestamp to execute in order
        sql_files.sort()

        # Execute each sql file
        for file in sql_files:
            print("Migrated <- ", file)
            try:
                with open(os.path.join('./migrations/db/', file), 'r') as sql_file:
                    sql_query = sql_file.read()
                    cursor.execute(sql_query)
            except IsADirectoryError:
                pass
        cursor.close()

    def _drop_db(cls):
        try:
            config.db_config["database"] = "postgres"
            # Connect to a different database (e.g. the default 'postgres' database) to drop the test database
            drop_db_connection = psycopg2.connect(**config.db_config)
            drop_db_connection.autocommit = True
            cursor = drop_db_connection.cursor()
            cursor.execute("SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'ipauthor_test';")
            # Drop the test database
            cursor.execute("DROP DATABASE ipauthor_test;")
            cursor.close()
            drop_db_connection.close()
        except:
            pass

    @classmethod
    def tearDownClass(cls):
        # Close all connections to the test database
        cls.connection.close()
        cls._drop_db(cls)
        print("\n**** Deleted IPAuthor Test DB ****")

    def setUp(self):
        config.db_config["database"] = "ipauthor_test"
        config.db = config.PostgresDB(config=config.db_config, logger=config.logger)
        config.env = "dev"
        config.sandbox = True
        config.sandbox_generate = True
        self.cases = DottedDict(json.load(open("./services/tests/data.json","r")))
        # self.cases = DottedDict(json.load(open("data.json","r")))
        self.client = app.test_client()
        self.data = {}