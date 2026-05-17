from datetime import date


def _as_float(value: str) -> float | None:
    try:
        return float(str(value).replace("%", "").strip())
    except (TypeError, ValueError):
        return None


def calculate_progress(uom_type: str, target: str, achievement: str, direction: str = "min") -> float:
    if uom_type == "Zero-based":
        return 100.0 if _as_float(achievement) == 0 else 0.0

    if uom_type == "Timeline":
        try:
            deadline = date.fromisoformat(target[:10])
            completed = date.fromisoformat(achievement[:10])
            return 100.0 if completed <= deadline else 60.0
        except ValueError:
            return 0.0

    target_num = _as_float(target)
    achieved_num = _as_float(achievement)
    if not target_num or achieved_num is None or achieved_num == 0:
        return 0.0

    ratio = target_num / achieved_num if direction == "max" else achieved_num / target_num
    return max(0.0, min(round(ratio * 100, 2), 150.0))
