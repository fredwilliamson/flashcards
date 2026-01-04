#!/usr/bin/env python3
"""
Script to create an admin user for testing
Usage: python create_admin.py
"""

from app.database import SessionLocal
from app.models.user import User
from argon2 import PasswordHasher

def create_admin():
    db = SessionLocal()
    ph = PasswordHasher()
    
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.username == 'admin').first()
        if existing:
            print('❌ Admin user already exists!')
            print(f'   Username: admin')
            print(f'   ID: {existing.id}')
            return
        
        # Create admin user
        admin = User(
            username='admin',
            first_name='Admin',
            last_name='User',
            hashed_password=ph.hash('admin123'),
            is_admin=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print('✅ Admin user created successfully!')
        print(f'   Username: admin')
        print(f'   Password: admin123')
        print(f'   ID: {admin.id}')
        print(f'   Is Admin: {admin.is_admin}')
        
    except Exception as e:
        print(f'❌ Error creating admin: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_admin()



