from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse
from fastapi import status

class APIResponse:
    """Standardized API response wrapper"""
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK
    ) -> JSONResponse:
        """Return a successful API response"""
        response_data = {
            "success": True,
            "message": message,
            "data": data
        }
        return JSONResponse(content=response_data, status_code=status_code)
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Resource created successfully"
    ) -> JSONResponse:
        """Return a 201 Created response"""
        return APIResponse.success(data, message, status.HTTP_201_CREATED)
    
    @staticmethod
    def error(
        message: str = "An error occurred",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict] = None
    ) -> JSONResponse:
        """Return an error API response"""
        response_data = {
            "success": False,
            "message": message,
            "details": details
        }
        return JSONResponse(content=response_data, status_code=status_code)

def standard_response(
    success: bool = True,
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK
) -> Dict:
    """Create a standardized response dictionary"""
    return {
        "success": success,
        "message": message,
        "data": data
    } 