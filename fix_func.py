import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Completely replace the formatting function
new_func = """const formatIndianCurrency = (val, compact = false) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.round(Number(val));
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (compact) {
    if (absNum >= 10000000) { // 1 Crore
      return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`;
    }
    if (absNum >= 100000) { // 1 Lakh
      return `${sign}₹${(absNum / 100000).toFixed(2)} Lakh`;
    }
    if (absNum >= 1000) {
      return `${sign}₹${absNum.toLocaleString('en-IN')}`;
    }
    return `${sign}₹${absNum.toLocaleString('en-IN')}`;
  }

  if (absNum >= 10000000) {
    return `${sign}₹${absNum.toLocaleString('en-IN')} (${(absNum / 10000000).toFixed(2)} Cr)`;
  }
  if (absNum >= 100000) {
    return `${sign}₹${absNum.toLocaleString('en-IN')} (${(absNum / 100000).toFixed(2)} Lakh)`;
  }
  return `${sign}₹${absNum.toLocaleString('en-IN')}`;
};"""

# Replace anything from "const formatIndianCurrency = (val, compact = false) => {" up to "};"
content = re.sub(r'const formatIndianCurrency = \(val, compact = false\) => \{.*?\n\};', new_func, content, flags=re.DOTALL)

# Fix any hardcoded strings
content = re.sub(r'[^\w\s\-\+\.,/]*175,000 / ha', '₹75,000 / ha', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
