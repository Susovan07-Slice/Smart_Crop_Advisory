import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r'>\s*[^<]*English\s*</button>',
    r'>🇮🇳 English</button>',
    content
)

content = re.sub(
    r'(writingLang === \'or\'[^\>]*\>)\s*[^<]*\s*</button>',
    r'\1🇮🇳 ଓଡ଼ିଆ</button>',
    content
)

content = re.sub(
    r'(writingLang === \'hi\'[^\>]*\>)\s*[^<]*\s*</button>',
    r'\1🇮🇳 हिन्दी</button>',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
