from pathlib import Path
import sys


OPTIMIZER_ROOT = Path(__file__).resolve().parents[1]

if str(OPTIMIZER_ROOT) not in sys.path:
    sys.path.insert(0, str(OPTIMIZER_ROOT))
