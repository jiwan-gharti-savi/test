from whoosh import scoring
from whoosh.index import create_in
from whoosh.fields import Schema, TEXT, ID, BOOLEAN
from whoosh.qparser import MultifieldParser, OrGroup, FuzzyTermPlugin
from whoosh.analysis import NgramWordAnalyzer
from whoosh.filedb.filestore import FileStorage


def _build_project_index(all_project_data):
    # Using NgramWordAnalyzer for the invention_title field with a specific gram size range
    ngram_analyzer = NgramWordAnalyzer(minsize=1, maxsize=8)

    # Define a schema for the index including n-gram field for the invention_title
    schema = Schema(
        project_id=ID(stored=True),
        invention_title=TEXT(stored=True, analyzer=ngram_analyzer),
        is_archive=BOOLEAN(stored=True)
    )

    # Create a file-based index
    storage = FileStorage(f"indexdir/{project_id}")
    ix = storage.create_index(schema)
    
    # Add documents to the index
    writer = ix.writer()
    for project_data in all_project_data:
        writer.add_document(
            project_id=str(project_data['project_id']),
            invention_title=project_data['invention_title'],
            is_archive=project_data['is_archive']
        )
    writer.commit()
    return ix

def _get_ix(project_id):
    storage = FileStorage(f"indexdir/{project_id}")
    ix = storage.open_index()
    return ix

def add_project_to_index(project_data):
    storage = FileStorage(f"indexdir/{project_id}")
    ix = storage.create_index(schema)
    writer = ix.writer()    
    writer.add_document(
        project_id=str(project_data['project_id']),
        invention_title=project_data['invention_title'],
        is_archive=project_data['is_archive']
    )
    writer.commit()
    return ix
    
def _search_projects(project_id, query_text):
    ix = _get_ix(project_id)
    with ix.searcher(weighting=scoring.Frequency) as searcher:
        # Enhance the parser with the fuzzy term plugin
        parser = MultifieldParser(["invention_title"], schema=ix.schema, group=OrGroup)
        parser.add_plugin(FuzzyTermPlugin())

        # Prepare a fuzzy query for each word in the query_text
        words = query_text.split()
        fuzzy_query = " ".join(word + "~" for word in words)  # Append '~' to each word for fuzzy searching
        
        # Parse the query using fuzzy search
        query = parser.parse(fuzzy_query)
        
        # Perform the search
        results = searcher.search(query, limit=None)
        
        # Filter results by 'is_archive' status
        filtered_results = [int(r.fields()['project_id']) for r in results]
        return filtered_results