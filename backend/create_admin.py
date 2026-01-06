#!/usr/bin/env python3
"""
Script to create an admin user in the database
Usage: python create_admin.py
"""

import sys
import os
from getpass import getpass

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password


def create_admin_user():
    """Create an admin user interactively"""
    
    print("🔐 Create Admin User")
    print("=" * 50)
    
    # Get user input
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    password = getpass("Password: ")
    password_confirm = getpass("Confirm password: ")
    
    # Validate input
    if not username or not email or not password:
        print("❌ All fields are required!")
        return
    
    if password != password_confirm:
        print("❌ Passwords don't match!")
        return
    
    if len(password) < 8:
        print("❌ Password must be at least 8 characters!")
        return
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print(f"❌ User with username '{username}' or email '{email}' already exists!")
            return
        
        # Create admin user
        admin_user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\n✅ Admin user created successfully!")
        print(f"   ID: {admin_user.id}")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Role: {admin_user.role}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating admin user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin_user()
