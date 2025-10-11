from __future__ import annotations

import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from ..database import get_session
from ..models import InventoryItem, Item, ItemCategory, Player
from ..schemas import InventoryItemRead, ItemRead
from ..utils.security import get_current_player

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/items", response_model=List[ItemRead])
def list_items(session: Session = Depends(get_session)) -> List[Item]:
    return session.exec(select(Item)).all()


@router.get("/me", response_model=List[InventoryItemRead])
def list_inventory(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> List[InventoryItem]:
    statement = select(InventoryItem).where(InventoryItem.player_id == current_player.id).options(
        selectinload(InventoryItem.item)
    )
    return session.exec(statement).all()


@router.post("/equip/{inventory_id}", response_model=InventoryItemRead)
def equip_item(
    inventory_id: int,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> InventoryItem:
    inventory_item = session.get(InventoryItem, inventory_id)
    if not inventory_item or inventory_item.player_id != current_player.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    inventory_item.equipped = True
    session.add(inventory_item)
    session.commit()
    session.refresh(inventory_item, attribute_names=["item"])
    return inventory_item


@router.post("/lootbox", response_model=InventoryItemRead)
def open_loot_box(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> InventoryItem:
    items = session.exec(select(Item)).all()
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No items available")
    weights = [
        5 if item.category == ItemCategory.WEAPON else 3 if item.category == ItemCategory.EQUIPMENT else 1
        for item in items
    ]
    item = random.choices(items, weights=weights, k=1)[0]
    inventory_item = InventoryItem(player_id=current_player.id, item_id=item.id, quantity=1)
    session.add(inventory_item)
    session.commit()
    session.refresh(inventory_item, attribute_names=["item"])
    return inventory_item
