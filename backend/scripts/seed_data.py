import database, models
import random
from sqlalchemy.orm import Session

def seed_data(db: Session):
    # Check if already seeded
    if db.query(models.Farmer).count() > 0:
        print("Database already seeded.")
        return

    districts = ["Pune", "Nashik", "Nagpur", "Satara", "Kolhapur"]
    crops = ["Wheat", "Sugarcane", "Cotton", "Soybean", "Rice"]
    soils = ["Black Soil", "Red Soil", "Alluvial", "Laterite"]

    for i in range(1, 11):
        farmer = models.Farmer(
            name=f"Farmer {i}",
            phone=f"987654321{i % 10}",
            language=random.choice(["en", "hi", "mr"]),
            district=random.choice(districts),
            crop=random.choice(crops),
            soil_type=random.choice(soils),
            loan_amount=random.choice([0, 50000, 100000, 200000]),
            days_to_loan_due=random.choice([10, 30, 90, 180, 365])
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        # Add a record for each farmer
        record = models.FarmerRecord(
            farmer_id=farmer.id,
            rainfall_deviation_percent=random.uniform(-40, 30),
            mandi_price_drop_percent=random.uniform(0, 35)
        )
        
        # We need to compute score directly for seeded data or let the main API do it.
        # Let's import the scorer
        import sys, os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from services.distress_scorer import calculate_distress_score
        
        record.distress_score = calculate_distress_score(
            record.rainfall_deviation_percent,
            record.mandi_price_drop_percent,
            farmer.days_to_loan_due
        )

        db.add(record)
        db.commit()

    print("Seeded database with 10 farmers and records.")

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=database.engine)
    db = next(database.get_db())
    seed_data(db)
