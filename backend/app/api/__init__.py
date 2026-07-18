from .predict import router as predict_router
from .devices import router as devices_router
from .alerts  import router as alerts_router
from .history import router as history_router
from .stats   import router as stats_router
from .health  import router as health_router

__all__ = [
    "predict_router", "devices_router", "alerts_router",
    "history_router", "stats_router",   "health_router",
]
