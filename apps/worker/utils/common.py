import math

def sanitize(obj):
    if isinstance(obj, float) and (math.isinf(obj) or math.isnan(obj)):
        return 0.0
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    return obj
