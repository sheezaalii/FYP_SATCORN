# test_model.py

from datetime import datetime

class TestModel:

    def __init__(self, name):
        self.name = name
        self.created_at = datetime.now()

    def get_details(self):
        return {
            'name': self.name,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
