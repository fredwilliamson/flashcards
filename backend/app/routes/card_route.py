from fastapi import APIRouter, Depends, HTTPException
from ..schemas.card import CardResponse, CardPatch, CardReplace, CardCreate
from ..services.impl import CardServiceImpl
from ..dependencies import get_card_service
from ..auth.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(dependencies=[Depends(get_current_active_user)])


@router.get("/{card_id}", response_model=CardResponse)
def get_card(card_id: int, service: CardServiceImpl = Depends(get_card_service)):
    """Get card by ID"""
    card = service.get_by_id(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.get("", response_model=list[CardResponse])
@router.get("/", response_model=list[CardResponse])
def get_cards(service: CardServiceImpl = Depends(get_card_service)):
    """Get all cards (supports both with and without trailing slash)"""
    return service.get_all()


@router.post("", response_model=CardResponse, status_code=201)
@router.post("/", response_model=CardResponse, status_code=201)
def create_card(card: CardCreate, service: CardServiceImpl = Depends(get_card_service)):
    """Create a new card (supports both with and without trailing slash)"""
    return service.create(card)


@router.patch("/{card_id}", response_model=CardResponse)
def patch_card(card_id: int, card: CardPatch, service: CardServiceImpl = Depends(get_card_service)):
    """Partial update of a card"""
    return service.patch(card_id, card)


@router.put("/{card_id}", response_model=CardResponse)
def replace_card(card_id: int, card: CardReplace, service: CardServiceImpl = Depends(get_card_service)):
    """Full replacement of a card"""
    return service.update(card_id, card)


@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: int, service: CardServiceImpl = Depends(get_card_service)):
    """Delete a card"""
    if not service.delete(card_id):
        raise HTTPException(status_code=404, detail="Card not found")
    return None