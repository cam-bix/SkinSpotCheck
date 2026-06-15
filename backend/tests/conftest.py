import os
import tempfile

TEST_DIR = tempfile.mkdtemp(prefix="skinspotcheck-tests-")

os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite+pysqlite:///{TEST_DIR}/test.db"
os.environ["JWT_SECRET"] = "test-secret-change-me"
os.environ["UPLOAD_DIR"] = f"{TEST_DIR}/uploads"
os.environ["RATE_LIMIT_AUTH"] = "100/minute"
os.environ["RATE_LIMIT_SCAN"] = "100/minute"
