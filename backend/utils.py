# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if doc:
        doc['_id'] = str(doc['_id'])
    return doc
