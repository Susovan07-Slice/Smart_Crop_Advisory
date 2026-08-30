import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("return '?0';", "return '\u20b90';")
content = content.replace("`${sign}?${", "`${sign}\u20b9${")

old_location = "const [location, setLocation] = useState(() => {\n    return farmerProfile?.district || localStorage.getItem('smartCropLocation') || 'Cuttack';\n  });"
new_location = "const [location, setLocation] = useState(() => {\n    return localStorage.getItem('smartCropLocation') || farmerProfile?.district || 'Cuttack';\n  });"
content = content.replace(old_location, new_location)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
