from typing import Any, Optional
from schema import ResponseModel

def success_response(data: Optional[Any], message: str = "Success") -> ResponseModel:
    return ResponseModel(success=True, message=message, data=data)

def error_response(message: str, data: Optional[Any] = None) -> ResponseModel:
    return ResponseModel(success=False, message=message, data=data)
