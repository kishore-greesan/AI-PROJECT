from sqlalchemy.orm import Session
from typing import TypeVar, Generic, Type, Optional, List
from sqlalchemy import and_
from app.utils.exceptions import raise_not_found

T = TypeVar('T')

class BaseService(Generic[T]):
    """Base service class providing common CRUD operations"""
    
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get a record by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_by_id_or_raise(self, id: int) -> T:
        """Get a record by ID or raise 404 if not found"""
        record = self.get_by_id(id)
        if not record:
            raise raise_not_found(f"{self.model.__name__} not found")
        return record
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Get all records with pagination"""
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, **kwargs) -> T:
        """Create a new record"""
        record = self.model(**kwargs)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def update(self, id: int, **kwargs) -> T:
        """Update a record by ID"""
        record = self.get_by_id_or_raise(id)
        
        for field, value in kwargs.items():
            if hasattr(record, field) and value is not None:
                setattr(record, field, value)
        
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def delete(self, id: int) -> bool:
        """Delete a record by ID"""
        record = self.get_by_id_or_raise(id)
        self.db.delete(record)
        self.db.commit()
        return True
    
    def filter_by(self, **kwargs) -> List[T]:
        """Filter records by given criteria"""
        filters = []
        for field, value in kwargs.items():
            if hasattr(self.model, field):
                filters.append(getattr(self.model, field) == value)
        
        if filters:
            return self.db.query(self.model).filter(and_(*filters)).all()
        return self.get_all()
    
    def count(self) -> int:
        """Get total count of records"""
        return self.db.query(self.model).count() 