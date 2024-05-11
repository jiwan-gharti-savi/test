import os
import time
from contextlib import contextmanager
import random
import psycopg2
import psycopg2.extras
import yaml
from psycopg2 import InterfaceError, OperationalError, pool as pool
from rich.console import Console

console = Console()

import os
import yaml
import psycopg2
from psycopg2 import pool
import logging
from contextlib import contextmanager

class PostgresDB:
    def __init__(self, config: dict, logger):
        self.logger = logging.getLogger(__name__)
        self.config = config
        basedir = os.path.abspath(os.path.dirname(__file__))
        with open(f"{basedir}/postgresql.yml", 'r') as stream:
            try:
                self.queries = yaml.safe_load(stream)
            except yaml.YAMLError as exc:
                self.logger.error(exc)
        self._initialize_pool()

    def _initialize_pool(self):
        self.pool = pool.ThreadedConnectionPool(minconn=1, maxconn=10, **self.config)
        #self.logger.info("Database connection pool initialized")

    @contextmanager
    def getcursor(self):
        connection = None
        try:
            connection = self.pool.getconn()
            #print("Connection acquired")
            yield connection.cursor(cursor_factory=psycopg2.extras.NamedTupleCursor)
            connection.commit()
        except Exception as e:
            #print(f"Exception in cursor: {e}")
            if connection:
                connection.rollback()
            self.logger.error(f"Exception in cursor of db: {e}")
        finally:
            if connection:
                self.pool.putconn(connection)
                #print("Connection returned to pool")

    def _check_connection_health(self):
        if self.pool.closed:
            #self.logger.warning("Connection pool closed, reinitializing")
            self._initialize_pool()
        else:
            #self.logger.info("Connection pool is healthy")
            pass

    def _build_select_query(self, query_string: str, filters: str, values: str):
        columns = values.keys()
        filter_columns = list(set(filters) & set(columns))
        filter_values = [values[column] for column in filter_columns]
        filters_query = ''
        if len(filter_columns) > 0:
            filters_query = ' WHERE ' + ' AND '.join([
                f'{column} = %s'
                for index, column in enumerate(filter_columns)
            ])
        query_string = query_string.replace('{filters}', filters_query)
        return query_string, filter_values

    def _build_insert_query(self, query_string: str, conflict: list,
                            values: str):
        columns = values.keys()
        update_columns = list(set(columns) - set(conflict))
        update_values = list(values.values())
        column_string = ', '.join(columns)
        values_string = ', '.join(
            ['%s' for index, _ in enumerate(columns)])
        conflict_string = ', '.join(conflict)
        update_string = 'UPDATE SET modified_at = now()'
        if len(update_columns) > 0:
            update_string = 'UPDATE SET' + ','.join([
                f' {column} = EXCLUDED.{column} ' for column in update_columns
            ] + [' modified_at = now()'])
        query_string = query_string.replace('{columns}', column_string)
        query_string = query_string.replace('{values}', values_string)
        query_string = query_string.replace('{conflict}', conflict_string)
        query_string = query_string.replace('{update_query}', update_string)
        return query_string, update_values
    
    def _build_delete_query(self, query_string: dict, filters: dict, values: dict, table: dict):
        columns = values.keys()
        filter_columns = list(set(filters) & set(columns))
        update_values = list(values.values())
        table = table.get('table')
        query_string = query_string.replace('{table}',table)
        filters_query = ''
        
        if len(filter_columns) > 0:
            filter_query = ' WHERE ' + ' AND '.join([
                f'{column} = %s'
                for index, column in enumerate(filter_columns)])
            
        query_string = query_string.replace('{filters}',filter_query)
        return query_string, update_values
        
    def _build_query(self, query_key: str, values: dict, table: str):
        query_details = self.queries[query_key]
        query_string = query_details['query']
        qtype = query_details['type']
        if qtype == 'select':
            filters = query_details['filters']
            query, qvalues = self._build_select_query(query_string, filters,
                                                      values)
        elif qtype == 'insert':
            conflict = query_details['conflict']
            query, qvalues = self._build_insert_query(query_string, conflict,
                                                   values)
        if qtype == 'delete':
            filters = query_details['filters']
            query, qvalues = self._build_delete_query(query_string, filters,
                                                      values, table)
        return query, qvalues

    def _connect(self):
        pass
    #     """Initialize asyncpg Pool"""
    #     self.connection = psycopg2.connect(**self.config)
    #     self.logger.info("successfully initialized database pool")

    # @contextmanager
    # def getcursor(self):
    #     try:
    #         with self.connection.cursor(cursor_factory=psycopg2.extras.NamedTupleCursor) as cursor:
                
    #             yield cursor
    #     except Exception as e:
    #         print("Exception", e)
        
    # def connect(self):
    #     self._connect()

    def _bulk_execute(self, queries: list):
        results = []
        max_retries = 3
        for _ in range(max_retries):
            for query_details in queries:
                try:
                    with self.getcursor() as cursor:
                        table = {'table': query_details.get("table", 'default_table')}
                        query, qvalues = self._build_query(query_details['query'], query_details['values'], table)
                        cursor.execute(query, qvalues)
                        result = [row._asdict() for row in cursor]
                        results.append([dict(record) for record in result])
                except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
                    print(f"Database operation error: {e}")
                    time.sleep(3)
                except Exception as e:
                    print(f"Query execution failed: {e}")
                    time.sleep(3)
            if len(results) > 0:
                break
        return results
        
    def bulk_execute(self, queries: list):
        # if self.pool is None:
        #     self.connect()
        self._check_connection_health()
        results = self._bulk_execute(queries)
        return results

    def shutdown(self):
        self.pool.closeall()
        self.logger.info("Database connection pool has been closed")

    def execute(self, query: dict):
        results = self.bulk_execute(queries=[query])
        if len(results) == 0:
            return []
        return results[0]
