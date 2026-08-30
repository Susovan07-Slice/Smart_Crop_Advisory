import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Dark Mode / Light Mode buttons
content = re.sub(r'<span>[^<]*Light Mode</span>', r'<span>Light Mode</span>', content)
content = re.sub(r'<span>[^<]*Dark Mode</span>', r'<span>Dark Mode</span>', content)

# Fix Language Buttons
content = re.sub(
    r'dY[^\<]*English\s*</button>',
    r'🇮🇳 English</button>',
    content
)
content = re.sub(
    r'(writingLang === \'or\'[^\>]*\>)\s*dY[^\<]*\s*</button>',
    r'\1🇮🇳 ଓଡ଼ିଆ</button>',
    content
)
content = re.sub(
    r'(writingLang === \'hi\'[^\>]*\>)\s*dY[^\<]*\s*</button>',
    r'\1🇮🇳 हिन्दी</button>',
    content
)

# Fix Namaste!
content = re.sub(
    r'\{nlpResponse \|\| "[^"]*Namaste!',
    r'{nlpResponse || "🌾 Namaste!',
    content
)

# Fix CROP_NAME_MAP
new_crop_map = """const CROP_NAME_MAP = {
  Rice: { hi: "चावल", or: "ଧାନ" },
  Ragi: { hi: "रागी (मडुआ)", or: "ମାଣ୍ଡିଆ" },
  "Moong(Green Gram)": { hi: "मूंग (हरा चना)", or: "ମୁଗ" },
  Moong: { hi: "मूंग", or: "ମୁଗ" },
  Groundnut: { hi: "मूंगफली", or: "ଚିନାବାଦାମ" },
  Jute: { hi: "जूट", or: "ଝୋଟ" },
  Maize: { hi: "मक्का", or: "ମକା" },
  Cotton: { hi: "कपास", or: "କପା" },
  Sugarcane: { hi: "गन्ना", or: "ଆଖୁ" },
  Pulses: { hi: "दालें", or: "ଡାଲି" },
  Sesamum: { hi: "तिल", or: "ରାଶି" },
  Wheat: { hi: "गेहूं", or: "ଗହମ" },
  Mustard: { hi: "सरसों", or: "ସୋରିଷ" },
  Potato: { hi: "आलू", or: "ଆଳୁ" },
  Urad: { hi: "उड़द", or: "ବିରି" },
  Arhar: { hi: "अरहर", or: "ହରଡ଼" },
  Gram: { hi: "चना", or: "ଚଣା" }
};"""

content = re.sub(r'const CROP_NAME_MAP = \{.*?\};', new_crop_map, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
