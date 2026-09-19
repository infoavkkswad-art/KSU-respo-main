"""
KAWAD SWAD
INITIAL FULFILMENT RULES

Delegates to migrate_fulfillment_rules.py so origin 451225 and the
six free PINs cannot be seeded as a weaker/partial set.
"""

import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = Path(__file__).resolve().parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


async def main() -> None:
    if str(SCRIPTS_DIR) not in sys.path:
        sys.path.insert(0, str(SCRIPTS_DIR))

    from migrate_fulfillment_rules import migrate_fulfillment_rules

    await migrate_fulfillment_rules()


if __name__ == "__main__":
    asyncio.run(main())
