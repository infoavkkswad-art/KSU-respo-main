import unittest

from app.services.webhook_events import (
    STATUS_IGNORED,
    STATUS_PROCESSED,
    capture_may_mark_paid,
    failure_may_mark_failed,
    is_terminal_event_record,
    normalize_event_id,
    paid_order_may_be_overwritten,
    record_webhook_event,
)


class FakeCollection:
    def __init__(self):
        self.docs = []

    async def find_one(self, query):
        event_id = query.get("eventId")
        for doc in self.docs:
            if doc.get("eventId") == event_id:
                return doc
        return None

    async def insert_one(self, document):
        from pymongo.errors import DuplicateKeyError

        event_id = document.get("eventId")
        for doc in self.docs:
            if doc.get("eventId") == event_id:
                raise DuplicateKeyError("eventId")
        self.docs.append(dict(document))


class FakeDb(dict):
    def __init__(self):
        super().__init__()
        self["webhook_events"] = FakeCollection()


class WebhookRetryHelpersTest(unittest.IsolatedAsyncioTestCase):
    def test_event_id_normalization(self):
        self.assertIsNone(normalize_event_id(None))
        self.assertIsNone(normalize_event_id("  "))
        self.assertEqual(normalize_event_id(" evt_1 "), "evt_1")

    def test_terminal_records(self):
        self.assertFalse(is_terminal_event_record(None))
        self.assertTrue(
            is_terminal_event_record({"status": STATUS_PROCESSED})
        )
        self.assertTrue(
            is_terminal_event_record({"status": STATUS_IGNORED})
        )
        self.assertFalse(
            is_terminal_event_record({"status": "received"})
        )

    def test_paid_order_is_not_overwritten(self):
        self.assertFalse(paid_order_may_be_overwritten("paid"))
        self.assertTrue(paid_order_may_be_overwritten("pending"))
        self.assertTrue(paid_order_may_be_overwritten("failed"))

    def test_capture_upgrades_pending_and_failed_only(self):
        self.assertTrue(capture_may_mark_paid("pending"))
        self.assertTrue(capture_may_mark_paid("failed"))
        self.assertFalse(capture_may_mark_paid("paid"))

    def test_failure_does_not_clobber_paid(self):
        self.assertTrue(failure_may_mark_failed("pending"))
        self.assertFalse(failure_may_mark_failed("paid"))
        self.assertFalse(failure_may_mark_failed("failed"))

    async def test_record_webhook_event_persists_and_dedupes(self):
        db = FakeDb()

        first = await record_webhook_event(
            db,
            event_id="evt_1",
            event_type="payment.captured",
            razorpay_order_id="order_1",
            status=STATUS_PROCESSED,
        )
        second = await record_webhook_event(
            db,
            event_id="evt_1",
            event_type="payment.captured",
            razorpay_order_id="order_1",
            status=STATUS_PROCESSED,
        )

        self.assertTrue(first)
        self.assertFalse(second)
        self.assertEqual(len(db["webhook_events"].docs), 1)

    async def test_missing_event_id_is_not_persisted(self):
        db = FakeDb()
        wrote = await record_webhook_event(
            db,
            event_id=" ",
            event_type="payment.captured",
            razorpay_order_id="order_1",
            status=STATUS_PROCESSED,
        )
        self.assertFalse(wrote)
        self.assertEqual(db["webhook_events"].docs, [])


if __name__ == "__main__":
    unittest.main()
