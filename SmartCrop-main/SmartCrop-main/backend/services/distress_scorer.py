def calculate_distress_score(rainfall_dev: float, price_drop: float, days_to_loan: int) -> float:
    # 1. Normalize Rainfall Deviation (assuming 0 to -50% is worst)
    # If rainfall_dev is negative, it's a deficit. If positive, it's excess. Both can be bad, 
    # but let's assume deficit is the primary distress driver for MVP.
    rain_score = min(max(-rainfall_dev, 0), 50) / 50.0  # 0 to 1
    
    # 2. Normalize Price Drop (assuming 0 to 30% drop is worst)
    price_score = min(max(price_drop, 0), 30) / 30.0  # 0 to 1
    
    # 3. Normalize Loan Due (0 to 365 days, 0 is worst)
    # If loan is due in 0 days, score is 1. If due in 365 days, score is 0.
    loan_score = max(365 - days_to_loan, 0) / 365.0  # 0 to 1
    
    # Weights
    w_rain = 0.4
    w_price = 0.4
    w_loan = 0.2
    
    # Final score 0-100
    risk = (w_rain * rain_score + w_price * price_score + w_loan * loan_score) * 100
    return min(risk, 100.0)
