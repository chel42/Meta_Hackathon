from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_has_upgrade_and_downgrade() -> None:
    root = Path(__file__).resolve().parents[1]
    config = Config(str(root / "alembic.ini"))
    config.set_main_option("script_location", str(root / "alembic"))
    script = ScriptDirectory.from_config(config)
    revisions = list(script.walk_revisions())
    assert revisions
    head = script.get_current_head()
    assert head
    revision = script.get_revision(head)
    assert revision.module.upgrade
    assert revision.module.downgrade
