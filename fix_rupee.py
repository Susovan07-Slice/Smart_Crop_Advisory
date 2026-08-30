import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace corrupted ₹ in formatIndianCurrency
content = re.sub(r'return [\'"`],10[\'"`];', r"return '₹0';", content)
content = re.sub(r'return `\$\{sign\},1\$\{\(absNum / 10000000\)\.toFixed\(2\)\} Cr`;', r'return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`;', content)
content = re.sub(r'return `\$\{sign\},1\$\{\(absNum / 100000\)\.toFixed\(2\)\} Lakh`;', r'return `${sign}₹${(absNum / 100000).toFixed(2)} Lakh`;', content)
content = re.sub(r'return `\$\{sign\},1\$\{result\}`;', r'return `${sign}₹${result}`;', content)
content = re.sub(r',175,000 / ha', r'₹75,000 / ha', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
