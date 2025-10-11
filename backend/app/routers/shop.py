from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..models import InventoryItem, Item, Player
from ..schemas import InventoryItemRead, ShopPurchaseRequest
from ..utils.security import get_current_player

router = APIRouter(prefix="/shop", tags=["shop"])


@router.post("/purchase", response_model=InventoryItemRead)
def purchase_item(
    payload: ShopPurchaseRequest,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> InventoryItem:
    item = session.get(Item, payload.item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    total_cost = item.price * payload.quantity
    if current_player.currency < total_cost:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient currency")
    current_player.currency -= total_cost
    inventory_item = InventoryItem(player_id=current_player.id, item_id=item.id, quantity=payload.quantity)
    session.add(current_player)
    session.add(inventory_item)
    session.commit()
    session.refresh(inventory_item)
    return inventory_item
