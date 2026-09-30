import unittest

from app.config import (
    Settings,
    assert_runtime_secrets,
    required_boot_secret_errors,
)


def _settings(**overrides) -> Settings:
    values = {
        "mongodb_uri": "mongodb://127.0.0.1:27017",
        "razorpay_key_id": "rzp_live_examplekey",
        "razorpay_key_secret": "not-a-real-secret",
        "razorpay_webhook_secret": "not-a-real-webhook-secret",
    }
    values.update(overrides)
    return Settings(**values)


class SecretBootTest(unittest.TestCase):
    def test_complete_secrets_pass(self):
        self.assertEqual(required_boot_secret_errors(_settings()), [])
        assert_runtime_secrets(_settings())

    def test_missing_mongo_uri_fails(self):
        errors = required_boot_secret_errors(_settings(mongodb_uri="  "))
        self.assertTrue(any("MONGODB_URI" in item for item in errors))

    def test_empty_razorpay_key_fails(self):
        errors = required_boot_secret_errors(_settings(razorpay_key_id=""))
        self.assertTrue(any("RAZORPAY_KEY_ID" in item for item in errors))

    def test_legacy_placeholders_fail(self):
        errors = required_boot_secret_errors(
            _settings(
                razorpay_key_id="rzp_test_placeholder",
                razorpay_key_secret="placeholder_secret",
                razorpay_webhook_secret="webhook_secret_placeholder",
            )
        )
        self.assertEqual(len(errors), 3)

    def test_placeholder_substring_fails(self):
        errors = required_boot_secret_errors(
            _settings(razorpay_webhook_secret="my_placeholder_token")
        )
        self.assertTrue(
            any("RAZORPAY_WEBHOOK_SECRET" in item for item in errors)
        )

    def test_assert_raises(self):
        with self.assertRaises(RuntimeError) as raised:
            assert_runtime_secrets(_settings(mongodb_uri=""))
        self.assertIn("refused to boot", str(raised.exception))


if __name__ == "__main__":
    unittest.main()
