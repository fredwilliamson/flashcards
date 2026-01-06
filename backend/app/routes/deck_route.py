from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from ..schemas.deck import DeckResponse, DeckCreate, DeckPatch, DeckReplace
from ..schemas.csv_import import CSVImportResponse
from ..services.impl import DeckServiceImpl, CardServiceImpl
from ..dependencies import get_deck_service, get_card_service
from ..auth.dependencies import get_current_active_user
from ..models.user import User
from ..services.csv_import_service import CSVImportService

router = APIRouter(dependencies=[Depends(get_current_active_user)])


@router.get("", response_model=list[DeckResponse])
@router.get("/", response_model=list[DeckResponse])
def get_decks(service: DeckServiceImpl = Depends(get_deck_service)):
    """Get all decks (supports both with and without trailing slash)"""
    return service.get_all()


@router.get("/{deck_id}", response_model=DeckResponse)
def get_deck(deck_id: int, service: DeckServiceImpl = Depends(get_deck_service)):
    """Get a specific deck by ID"""
    deck = service.get_by_id(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck


@router.post("", response_model=DeckResponse, status_code=201)
@router.post("/", response_model=DeckResponse, status_code=201)
def create_deck(deck: DeckCreate, service: DeckServiceImpl = Depends(get_deck_service)):
    """Create a new deck (supports both with and without trailing slash)"""
    return service.create(deck)


@router.patch("/{deck_id}", response_model=DeckResponse)
def patch_deck(deck_id: int, deck: DeckPatch, service: DeckServiceImpl = Depends(get_deck_service)):
    """Partial update of a deck"""
    return service.patch(deck_id, deck)


@router.put("/{deck_id}", response_model=DeckResponse)
def replace_deck(deck_id: int, deck: DeckReplace, service: DeckServiceImpl = Depends(get_deck_service)):
    """Full replacement of a deck"""
    return service.update(deck_id, deck)


@router.delete("/{deck_id}", status_code=204)
def delete_deck(deck_id: int, service: DeckServiceImpl = Depends(get_deck_service)):
    """Delete a deck"""
    if not service.delete(deck_id):
        raise HTTPException(status_code=404, detail="Deck not found")
    return None


@router.get("/{deck_id}/cards", response_model=list)
def get_deck_cards(
    deck_id: int,
    deck_service: DeckServiceImpl = Depends(get_deck_service),
    card_service: CardServiceImpl = Depends(get_card_service)
):
    """Get all cards for a specific deck"""
    # Verify deck exists
    deck = deck_service.get_by_id(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return card_service.get_by_deck_id(deck_id)


@router.delete("/{deck_id}/cards", status_code=204)
def delete_all_deck_cards(
    deck_id: int,
    deck_service: DeckServiceImpl = Depends(get_deck_service),
    card_service: CardServiceImpl = Depends(get_card_service),
    current_user: User = Depends(get_current_active_user)
):
    """Delete all cards in a deck (admin or deck creator only)"""
    # Check deck exists
    deck = deck_service.get_by_id(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    # Check permissions (creator or admin)
    if deck.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete cards from this deck"
        )
    
    # Get all cards and delete them
    cards = card_service.get_by_deck_id(deck_id)
    card_ids = [card.id for card in cards]
    if card_ids:
        card_service.delete_all(card_ids)
    
    return None


@router.post("/{deck_id}/import-csv", response_model=CSVImportResponse)
async def import_cards_csv(
    deck_id: int,
    file: UploadFile = File(...),
    deck_service: DeckServiceImpl = Depends(get_deck_service),
    card_service: CardServiceImpl = Depends(get_card_service),
    current_user: User = Depends(get_current_active_user)
):
    """
    Import cards from CSV file (Option B: best effort).
    
    CSV Format:
    question,answer,keywords,hint
    "Question?","Answer","keyword1,keyword2","Optional hint"
    
    - Creates valid cards
    - Reports errors for invalid lines
    - Requires: creator of deck or admin
    """
    # Check deck exists
    deck = deck_service.get_by_id(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    # Check permissions (creator or admin)
    if deck.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to import cards to this deck"
        )
    
    # Check file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )
    
    # Read file content
    content = await file.read()
    
    # Import CSV
    try:
        csv_service = CSVImportService(card_service, deck_id)
        result = csv_service.import_csv(content)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

