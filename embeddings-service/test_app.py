import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import app


class StubReranker:
    def predict(self, pairs):
        return [0.15, 0.91, 0.43][: len(pairs)]


class EmbeddingsServiceTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app.app)

    def test_rerank_returns_scores_sorted_desc(self):
        with patch.object(app, "get_reranker", return_value=StubReranker()):
            response = self.client.post(
                "/rerank",
                json={
                    "query": "policy",
                    "candidates": ["alpha", "beta", "gamma"],
                    "topN": 2,
                },
            )

        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertEqual(os.environ.get("MODEL_RERANKER_PATH", "/models/bge-reranker"), payload["model"])
        self.assertEqual(2, len(payload["results"]))
        self.assertEqual(1, payload["results"][0]["index"])
        self.assertGreaterEqual(payload["results"][0]["score"], payload["results"][1]["score"])

    def test_rerank_rejects_empty_candidates(self):
        response = self.client.post(
            "/rerank",
            json={
                "query": "policy",
                "candidates": [],
            },
        )
        self.assertEqual(422, response.status_code)


if __name__ == "__main__":
    unittest.main()

