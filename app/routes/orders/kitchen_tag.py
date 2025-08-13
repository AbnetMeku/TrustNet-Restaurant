# routes/orders/kitchen_tag.py
from app.models.models import KitchenTagCounter, db
from datetime import date

def generate_kitchen_tag() -> str:
    """
    Generates a 4-digit kitchen tag that resets daily.
    Format: '0001', '0002', ..., '9999'
    """
    today = date.today()

    # Get today's counter
    counter = KitchenTagCounter.query.filter_by(date=today).first()

    if not counter:
        counter = KitchenTagCounter(date=today, last_number=1)
        db.session.add(counter)
    else:
        counter.last_number += 1
        if counter.last_number > 9999:
            counter.last_number = 1  # reset after 9999

    db.session.commit()

    return f"{counter.last_number:04d}"
