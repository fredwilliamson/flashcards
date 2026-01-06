from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings
import socket

settings = get_settings()

# Optional: Force IPv4 to avoid IPv6 issues on some hosting platforms
# Set FORCE_IPV4=true in .env to enable (useful for Render, Railway)
# Leave as false for Supabase (which works better with dual stack)
if settings.FORCE_IPV4:
    print("⚠️ Forcing IPv4 connections (FORCE_IPV4=true)")
    _original_getaddrinfo = socket.getaddrinfo
    
    def _getaddrinfo_ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
        """Force IPv4 resolution only"""
        return _original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
    
    socket.getaddrinfo = _getaddrinfo_ipv4_only
else:
    print("✅ Using dual stack IPv4/IPv6 (recommended for Supabase)")

# Add connection timeout and pool settings for better reliability
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "connect_timeout": 30,  # Increased from 10 to 30 seconds for Supabase
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



