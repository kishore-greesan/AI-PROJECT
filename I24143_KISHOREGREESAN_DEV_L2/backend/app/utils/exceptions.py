from fastapi import HTTPException, status
from typing import Optional

class EPMSException(Exception):
    """Base exception for EPMS application"""
    pass

def raise_unauthorized(detail: str = "Invalid credentials") -> HTTPException:
    """Raise HTTP 401 Unauthorized exception"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )

def raise_forbidden(detail: str = "Access denied") -> HTTPException:
    """Raise HTTP 403 Forbidden exception"""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail
    )

def raise_not_found(detail: str = "Resource not found") -> HTTPException:
    """Raise HTTP 404 Not Found exception"""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=detail
    )

def raise_bad_request(detail: str = "Bad request") -> HTTPException:
    """Raise HTTP 400 Bad Request exception"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )

def raise_conflict(detail: str = "Resource conflict") -> HTTPException:
    """Raise HTTP 409 Conflict exception"""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail
    )

def raise_internal_error(detail: str = "Internal server error") -> HTTPException:
    """Raise HTTP 500 Internal Server Error exception"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=detail
    ) 