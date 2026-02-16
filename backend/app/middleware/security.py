"""
Security middleware for adding security headers to all responses
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to all HTTP responses
    
    Headers added:
    - X-Content-Type-Options: Prevents MIME-sniffing
    - X-Frame-Options: Prevents clickjacking
    - X-XSS-Protection: Enables XSS filter
    - Strict-Transport-Security: Enforces HTTPS (production only)
    - Content-Security-Policy: Prevents XSS attacks
    """
    
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Enable XSS filter
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Content Security Policy
        # More permissive CSP for Swagger docs to allow CDN resources
        if request.url.path.startswith("/docs") or request.url.path.startswith("/redoc"):
            # Allow Swagger UI resources from CDNs
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: https://fastapi.tiangolo.com https://cdn.jsdelivr.net; "
                "font-src 'self' https://cdn.jsdelivr.net; "
                "connect-src 'self'"
            )
        else:
            # Strict CSP for API endpoints
            csp = "default-src 'self'"
        
        response.headers["Content-Security-Policy"] = csp
        
        # HSTS (only in production with HTTPS)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (formerly Feature-Policy)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response




