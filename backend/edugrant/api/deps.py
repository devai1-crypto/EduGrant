from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..state.db import get_db, Institution

async def verify_admin_token(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    """
    Verifies the admin password for a specific institution.
    Expected format: Bearer <institute_id>:<password>
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        scheme, credentials = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        if ":" not in credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials format. Expected institute_id:password"
            )
            
        institute_id, password = credentials.split(":", 1)
        
        # Verify in database
        result = await db.execute(select(Institution).where(Institution.id == institute_id))
        institution = result.scalar_one_or_none()
        
        if not institution or institution.admin_password != password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid institution or password"
            )
            
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    return institute_id
