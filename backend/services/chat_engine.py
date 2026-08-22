"""
SmartCrop AI Chat Engine
========================
A rule-based conversational assistant for Indian farmers.

Architecture:
  - This module exposes a single function: generate_response(message, history, language)
  - When you're ready to plug in your ML model, simply replace the
    logic inside generate_response() — the API layer won't need to change.
"""

import re
import random
from datetime import datetime

# ---------------------------------------------------------------------------
# Knowledge Base — Organized by agricultural topic and language
# ---------------------------------------------------------------------------

KNOWLEDGE_BASE = {
    "weather": {
        "keywords": ["weather", "rain", "rainfall", "monsoon", "drought", "flood", "temperature", "humidity", "forecast", "climate", "storm", "heatwave", "cold", "frost", "barish", "mausam", "pag", "pani", "kharap", "sukha"],
        "responses": {
            "en": [
                "Based on current regional patterns, moderate rainfall is expected over the next 3-5 days. Make sure your field drainage is clear to prevent waterlogging.",
                "The monsoon this season has been slightly below average. Consider scheduling irrigation during dry spells, especially for water-sensitive crops like paddy.",
                "Temperature trends suggest warm days ahead. If you're growing vegetables, consider mulching to retain soil moisture and protect roots from heat stress.",
                "Weather conditions look favorable for sowing this week. Morning humidity levels are good for germination. Avoid sowing if heavy rain is forecasted within 24 hours.",
                "I'd recommend checking your local Krishi Vigyan Kendra (KVK) for hyperlocal weather advisories. They issue 5-day agro-met forecasts specifically for your district.",
            ],
            "hi": [
                "वर्तमान क्षेत्रीय पैटर्न के आधार पर, अगले 3-5 दिनों में मध्यम बारिश होने की उम्मीद है। जलभराव को रोकने के लिए सुनिश्चित करें कि आपके खेत की जल निकासी साफ है।",
                "इस मौसम में मानसून औसत से थोड़ा कम रहा है। सूखे के दौरान सिंचाई का समय निर्धारित करने पर विचार करें, विशेष रूप से धान जैसी पानी के प्रति संवेदनशील फसलों के लिए।",
                "तापमान के रुझान बताते हैं कि आने वाले दिन गर्म होंगे। यदि आप सब्जियां उगा रहे हैं, तो मिट्टी की नमी बनाए रखने और जड़ों को गर्मी के तनाव से बचाने के लिए मल्चिंग पर विचार करें।",
                "इस सप्ताह बुवाई के लिए मौसम की स्थिति अनुकूल लग रही है। सुबह की नमी का स्तर अंकुरण के लिए अच्छा है। यदि 24 घंटे के भीतर भारी बारिश का पूर्वानुमान है तो बुवाई से बचें।",
                "मैं आपके जिले के लिए विशेष रूप से 5-दिवसीय कृषि-मौसम पूर्वानुमान जारी करने वाले आपके स्थानीय कृषि विज्ञान केंद्र (KVK) की जाँच करने की सलाह दूँगा।",
            ],
            "or": [
                "ବର୍ତ୍ତମାନର ଆଞ୍ଚଳିକ ଢାଞ୍ଚା ଉପରେ ଆଧାର କରି ଆସନ୍ତା 3-5 ଦିନ ମଧ୍ୟରେ ମଧ୍ୟମ ଧରଣର ବର୍ଷା ହେବାର ସମ୍ଭାବନା ଅଛି | ଜଳବନ୍ଦୀକୁ ରୋକିବା ପାଇଁ ଆପଣଙ୍କ ବିଲର ଜଳ ନିଷ୍କାସନ ସଫା ଥିବା ନିଶ୍ଚିତ କରନ୍ତୁ |",
                "ଚଳିତ ଋତୁରେ ମୌସୁମୀ ହାରାହାରି ଠାରୁ ସାମାନ୍ୟ କମ୍ ରହିଛି | ଶୁଖିଲା ସମୟରେ ଜଳସେଚନ କରିବାକୁ ବିଚାର କରନ୍ତୁ, ବିଶେଷ କରି ଧାନ ଭଳି ଫସଲ ପାଇଁ |",
                "ତାପମାତ୍ରା ଧାରା ସୂଚାଉଛି ଯେ ଆଗକୁ ଗରମ ଦିନ ଆସୁଛି | ଯଦି ଆପଣ ପନିପରିବା ଚାଷ କରୁଛନ୍ତି, ତେବେ ମାଟିର ଆର୍ଦ୍ରତା ବଜାୟ ରଖିବା ପାଇଁ ଆଚ୍ଛାଦନ (mulching) କରିବାକୁ ବିଚାର କରନ୍ତୁ |",
                "ଏହି ସପ୍ତାହରେ ବୁଣିବା ପାଇଁ ପାଗ ଅନୁକୂଳ ଲାଗୁଛି | ସକାଳର ଆର୍ଦ୍ରତା ଅଙ୍କୁରୋଦ୍ଗମ ପାଇଁ ଭଲ | ଯଦି 24 ଘଣ୍ଟା ମଧ୍ୟରେ ପ୍ରବଳ ବର୍ଷାର ପୂର୍ବାନୁମାନ ଥାଏ ତେବେ ବୁଣିବାରୁ ନିବୃତ୍ତ ରୁହନ୍ତୁ |",
                "ଆପଣଙ୍କ ଜିଲ୍ଲା ପାଇଁ ସ୍ୱତନ୍ତ୍ର ଭାବରେ 5 ଦିନିଆ କୃଷି-ପାଣିପାଗ ପୂର୍ବାନୁମାନ ପାଇଁ ଆପଣଙ୍କ ସ୍ଥାନୀୟ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK) ଯାଞ୍ଚ କରିବାକୁ ମୁଁ ପରାମର୍ଶ ଦେବି |",
            ]
        }
    },
    "crops": {
        "keywords": ["crop", "crops", "grow", "growing", "plant", "planting", "sow", "sowing", "harvest", "harvesting", "yield", "production", "variety", "fasal", "ugana", "chas", "chasa", "dhana", "buna", "fasala"],
        "responses": {
            "en": [
                "For Kharif season, rice, maize, soybean, and groundnut are excellent choices depending on your region. What crop are you currently growing?",
                "Crop rotation is key to maintaining soil health. If you grew paddy last season, consider pulses like moong or urad this season — they fix nitrogen naturally.",
                "To maximize yield, ensure you're using certified seeds from authorized dealers. The IARI and state agricultural universities release improved varieties every year.",
                "For Rabi season crops like wheat, mustard, and chickpea, land preparation should begin 2-3 weeks before sowing. Have you started preparing your field?",
                "Intercropping can boost your income significantly. For example, growing maize with cowpea or soybean with pigeon pea improves land use efficiency.",
            ],
            "hi": [
                "खरीफ मौसम के लिए, आपके क्षेत्र के आधार पर चावल, मक्का, सोयाबीन और मूंगफली उत्कृष्ट विकल्प हैं। आप वर्तमान में कौन सी फसल उगा रहे हैं?",
                "मिट्टी के स्वास्थ्य को बनाए रखने के लिए फसल चक्रण महत्वपूर्ण है। यदि आपने पिछले मौसम में धान उगाया था, तो इस मौसम में मूंग या उड़द जैसी दालों पर विचार करें — वे स्वाभाविक रूप से नाइट्रोजन को स्थिर करते हैं।",
                "उपज को अधिकतम करने के लिए, सुनिश्चित करें कि आप अधिकृत डीलरों से प्रमाणित बीजों का उपयोग कर रहे हैं। IARI और राज्य कृषि विश्वविद्यालय हर साल उन्नत किस्में जारी करते हैं।",
                "गेहूं, सरसों और चना जैसी रबी मौसम की फसलों के लिए, बुवाई से 2-3 सप्ताह पहले भूमि की तैयारी शुरू हो जानी चाहिए। क्या आपने अपने खेत की तैयारी शुरू कर दी है?",
                "मिश्रित खेती (Intercropping) से आपकी आय काफी बढ़ सकती है। उदाहरण के लिए, लोबिया के साथ मक्का या अरहर के साथ सोयाबीन उगाना भूमि उपयोग दक्षता में सुधार करता है।",
            ],
            "or": [
                "ଖରିଫ୍ ଋତୁ ପାଇଁ, ଆପଣଙ୍କ ଅଞ୍ଚଳ ଉପରେ ନିର୍ଭର କରି ଧାନ, ମକା, ସୋୟାବିନ୍ ଏବଂ ଚିନାବାଦାମ ଭଲ ବିକଳ୍ପ ଅଟେ | ଆପଣ ବର୍ତ୍ତମାନ କେଉଁ ଫସଲ ଚାଷ କରୁଛନ୍ତି?",
                "ମୃତ୍ତିକାର ସ୍ୱାସ୍ଥ୍ୟ ବଜାୟ ରଖିବା ପାଇଁ ଫସଲ ପର୍ଯ୍ୟାୟ (Crop rotation) ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ | ଯଦି ଆପଣ ଗତ ଋତୁରେ ଧାନ ଚାଷ କରିଥିଲେ, ତେବେ ଏହି ଋତୁରେ ମୁଗ କିମ୍ବା ବିରି ଭଳି ଡାଲି ଜାତୀୟ ଫସଲ କରିବାକୁ ବିଚାର କରନ୍ତୁ |",
                "ଅମଳ ବୃଦ୍ଧି କରିବା ପାଇଁ, ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ଆପଣ ପ୍ରାଧିକୃତ ବିକ୍ରେତାଙ୍କଠାରୁ ପ୍ରମାଣିତ ବିହନ ବ୍ୟବହାର କରୁଛନ୍ତି | IARI ଏବଂ ରାଜ୍ୟ କୃଷି ବିଶ୍ୱବିଦ୍ୟାଳୟ ପ୍ରତିବର୍ଷ ଉନ୍ନତ କିସମ ପ୍ରକାଶ କରନ୍ତି |",
                "ରବି ଋତୁ ଫସଲ ଯେପରିକି ଗହମ, ସୋରିଷ ଏବଂ ଚଣା ପାଇଁ ବୁଣିବାର 2-3 ସପ୍ତାହ ପୂର୍ବରୁ ଜମି ପ୍ରସ୍ତୁତି ଆରମ୍ଭ ହେବା ଉଚିତ୍ | ଆପଣ ନିଜ ବିଲ ପ୍ରସ୍ତୁତ କରିବା ଆରମ୍ଭ କରିଛନ୍ତି କି?",
                "ମିଶ୍ରିତ ଚାଷ ଆପଣଙ୍କ ଆୟକୁ ଯଥେଷ୍ଟ ବୃଦ୍ଧି କରିପାରିବ | ଉଦାହରଣ ସ୍ୱରୂପ, ହରଡ଼ ସହିତ ସୋୟାବିନ୍ ଚାଷ କରିବା ଜମିର ଉପଯୋଗୀତାକୁ ଉନ୍ନତ କରିଥାଏ |",
            ]
        }
    },
    "pests": {
        "keywords": ["pest", "pests", "insect", "insects", "disease", "fungus", "worm", "borer", "aphid", "mite", "blight", "rot", "wilt", "bug", "keeda", "rog", "poka", "roga", "fampi", "kita"],
        "responses": {
            "en": [
                "For pest management, start with Integrated Pest Management (IPM). Use neem oil spray (5ml/liter) as a first defense — it's organic and effective against many common pests.",
                "If you notice yellowing leaves with spots, it could be a fungal infection. Apply a copper-based fungicide and ensure proper spacing between plants for air circulation.",
                "Stem borers in rice can be managed by installing pheromone traps (5 per acre) and releasing Trichogramma parasitoids. Avoid excessive nitrogen application as it attracts pests.",
                "For whitefly in vegetables, yellow sticky traps work well. Place them at canopy height, about 10-15 per acre. Also check the undersides of leaves for eggs.",
                "Early detection is crucial! Walk through your field every 3-4 days and inspect plants carefully. Take a photo of any unusual symptoms and I can help identify the issue.",
            ],
            "hi": [
                "कीट प्रबंधन के लिए, एकीकृत कीट प्रबंधन (IPM) से शुरुआत करें। पहले बचाव के रूप में नीम के तेल के स्प्रे (5 मिली/लीटर) का उपयोग करें — यह जैविक है और कई सामान्य कीटों के खिलाफ प्रभावी है।",
                "यदि आपको धब्बों के साथ पीले पत्ते दिखाई देते हैं, तो यह फंगल संक्रमण हो सकता है। कॉपर आधारित फफूंदनाशक का प्रयोग करें और हवा के संचार के लिए पौधों के बीच उचित दूरी सुनिश्चित करें।",
                "चावल में तना छेदक (Stem borer) को फेरोमोन ट्रैप (5 प्रति एकड़) स्थापित करके नियंत्रित किया जा सकता है। अत्यधिक नाइट्रोजन के प्रयोग से बचें क्योंकि यह कीटों को आकर्षित करता है।",
                "सब्जियों में सफेद मक्खी के लिए, पीले चिपचिपे जाल (Yellow sticky traps) अच्छी तरह काम करते हैं। उन्हें 10-15 प्रति एकड़ के हिसाब से लगाएं। अंडों के लिए पत्तियों के नीचे के हिस्से की भी जाँच करें।",
                "जल्दी पहचान महत्वपूर्ण है! हर 3-4 दिन में अपने खेत से चलें और पौधों का सावधानीपूर्वक निरीक्षण करें। किसी भी असामान्य लक्षण की फोटो लें और मैं समस्या को पहचानने में मदद कर सकता हूँ।",
            ],
            "or": [
                "କୀଟ ପରିଚାଳନା ପାଇଁ, ସମନ୍ୱିତ କୀଟ ପରିଚାଳନା (IPM) ରୁ ଆରମ୍ଭ କରନ୍ତୁ | ପ୍ରଥମ ପ୍ରତିରକ୍ଷା ଭାବରେ ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ (5ml/ଲିଟର) ବ୍ୟବହାର କରନ୍ତୁ - ଏହା ଜୈବିକ ଏବଂ ଅନେକ ସାଧାରଣ କୀଟଙ୍କ ବିରୁଦ୍ଧରେ ପ୍ରଭାବଶାଳୀ |",
                "ଯଦି ଆପଣ ଦାଗ ସହିତ ହଳଦିଆ ପତ୍ର ଦେଖନ୍ତି, ଏହା କବକ (fungal) ସଂକ୍ରମଣ ହୋଇପାରେ | ଏକ ତମ୍ବା ଭିତ୍ତିକ ଫଙ୍ଗିସାଇଡ୍ ପ୍ରୟୋଗ କରନ୍ତୁ ଏବଂ ବାୟୁ ଚଳାଚଳ ପାଇଁ ଗଛଗୁଡିକ ମଧ୍ୟରେ ଉପଯୁକ୍ତ ବ୍ୟବଧାନ ନିଶ୍ଚିତ କରନ୍ତୁ |",
                "ଧାନରେ କାଣ୍ଡ ବିନ୍ଧା ପୋକକୁ ଫେରୋମୋନ୍ ଟ୍ରାପ୍ (ଏକର ପିଛା 5ଟି) ଲଗାଇ ନିୟନ୍ତ୍ରଣ କରାଯାଇପାରିବ | ଅତ୍ୟଧିକ ଯବକ୍ଷାରଜାନ ପ୍ରୟୋଗରୁ ନିବୃତ୍ତ ରୁହନ୍ତୁ କାରଣ ଏହା କୀଟମାନଙ୍କୁ ଆକର୍ଷିତ କରିଥାଏ |",
                "ପନିପରିବାରେ ଧଳା ମାଛି ପାଇଁ, ହଳଦିଆ ଷ୍ଟିକି ଟ୍ରାପ୍ (Yellow sticky traps) ଭଲ କାମ କରେ | ଏକର ପିଛା ପ୍ରାୟ 10-15 ଟି ଲଗାନ୍ତୁ | ଅଣ୍ଡା ପାଇଁ ପତ୍ରର ତଳ ଅଂଶ ମଧ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ |",
                "ଶୀଘ୍ର ଚିହ୍ନଟ କରିବା ଅତ୍ୟନ୍ତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ! ପ୍ରତି 3-4 ଦିନରେ ଆପଣଙ୍କ ବିଲ ପରିଦର୍ଶନ କରନ୍ତୁ ଏବଂ ଗଛଗୁଡ଼ିକୁ ଯତ୍ନର ସହିତ ଯାଞ୍ଚ କରନ୍ତୁ | କୌଣସି ଅସାଧାରଣ ଲକ୍ଷଣର ଫଟୋ ନିଅନ୍ତୁ ଏବଂ ମୁଁ ସମସ୍ୟା ଚିହ୍ନଟ କରିବାରେ ସାହାଯ୍ୟ କରିପାରିବି |",
            ]
        }
    },
    "soil": {
        "keywords": ["soil", "mitti", "land", "fertility", "nutrient", "ph", "organic", "compost", "manure", "humus", "clay", "sandy", "loam", "testing", "mati", "maati", "khata"],
        "responses": {
            "en": [
                "Soil testing is the foundation of good farming. Get your soil tested at the nearest Soil Testing Laboratory — it costs only ₹10-50 and tells you exactly what nutrients your soil needs.",
                "For improving clay soil, add organic matter like farmyard manure (FYM) at 10-15 tonnes per hectare. It improves drainage and makes the soil easier to work with.",
                "If your soil pH is below 5.5 (acidic), apply lime at 2-4 quintals per hectare. If above 8.5 (alkaline), gypsum application can help bring it down.",
                "Green manuring with dhaincha (Sesbania) or sunhemp before the main crop adds organic matter and nitrogen naturally. Incorporate it 45-60 days after sowing.",
                "Vermicompost is excellent for soil health. Even 2-3 tonnes per hectare can significantly improve water retention, nutrient availability, and microbial activity.",
            ],
            "hi": [
                "मिट्टी परीक्षण अच्छी खेती की नींव है। निकटतम मिट्टी परीक्षण प्रयोगशाला में अपनी मिट्टी का परीक्षण करवाएं — इसकी कीमत केवल ₹10-50 है और यह आपको बताता है कि आपकी मिट्टी को किन पोषक तत्वों की आवश्यकता है।",
                "चिकनी मिट्टी (Clay soil) को सुधारने के लिए, 10-15 टन प्रति हेक्टेयर की दर से खेत की खाद (FYM) जैसे कार्बनिक पदार्थ मिलाएं। यह जल निकासी में सुधार करता है।",
                "यदि आपकी मिट्टी का pH 5.5 (अम्लीय) से कम है, तो 2-4 क्विंटल प्रति हेक्टेयर की दर से चूना (Lime) डालें। यदि 8.5 (क्षारीय) से ऊपर है, तो जिप्सम का उपयोग इसे कम करने में मदद कर सकता है।",
                "मुख्य फसल से पहले ढैंचा या सनई के साथ हरी खाद प्राकृतिक रूप से कार्बनिक पदार्थ और नाइट्रोजन जोड़ती है। बुवाई के 45-60 दिन बाद इसे मिट्टी में मिला दें।",
                "वर्मीकम्पोस्ट मिट्टी के स्वास्थ्य के लिए उत्कृष्ट है। 2-3 टन प्रति हेक्टेयर भी जल प्रतिधारण, पोषक तत्वों की उपलब्धता और सूक्ष्मजैविक गतिविधि में काफी सुधार कर सकता है।",
            ],
            "or": [
                "ମୃତ୍ତିକା ପରୀକ୍ଷା ହେଉଛି ଭଲ ଚାଷର ମୂଳଦୁଆ | ନିକଟସ୍ଥ ମୃତ୍ତିକା ପରୀକ୍ଷାଗାରରେ ଆପଣଙ୍କ ମାଟି ପରୀକ୍ଷା କରାନ୍ତୁ - ଏହାର ମୂଲ୍ୟ କେବଳ ₹10-50 ଏବଂ ଏହା ଆପଣଙ୍କୁ ଠିକ୍ ଭାବରେ କହିଥାଏ ଯେ ଆପଣଙ୍କ ମାଟିରେ କେଉଁ ପୋଷକ ତତ୍ତ୍ୱ ଦରକାର |",
                "କାଦୁଅ ମାଟିର ଉନ୍ନତି ପାଇଁ, ହେକ୍ଟର ପିଛା 10-15 ଟନ୍ ହିସାବରେ ଗୋବର ଖତ (FYM) ମିଶାନ୍ତୁ | ଏହା ଜଳ ନିଷ୍କାସନରେ ଉନ୍ନତି କରେ |",
                "ଯଦି ଆପଣଙ୍କ ମାଟିର pH 5.5 (ଅମ୍ଳୀୟ) ରୁ କମ୍, ତେବେ ହେକ୍ଟର ପିଛା 2-4 କ୍ୱିଣ୍ଟାଲ ଚୂନ ପ୍ରୟୋଗ କରନ୍ତୁ | ଯଦି 8.5 (କ୍ଷାରୀୟ) ରୁ ଅଧିକ, ଜିପସମ୍ ପ୍ରୟୋଗ ଏହାକୁ କମାଇବାରେ ସାହାଯ୍ୟ କରିପାରିବ |",
                "ମୁଖ୍ୟ ଫସଲ ପୂର୍ବରୁ ଧନିଚା କିମ୍ବା ଛଣପଟ ସହିତ ସବୁଜ ଖତ (Green manuring) ପ୍ରାକୃତିକ ଭାବରେ ଯବକ୍ଷାରଜାନ ଯୋଗ କରିଥାଏ | ବୁଣିବାର 45-60 ଦିନ ପରେ ଏହାକୁ ମାଟିରେ ମିଶାନ୍ତୁ |",
                "ମୃତ୍ତିକାର ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଜିଆଖତ (Vermicompost) ଉତ୍କୃଷ୍ଟ ଅଟେ | ହେକ୍ଟର ପିଛା 2-3 ଟନ୍ ମଧ୍ୟ ଜଳ ଧାରଣ କ୍ଷମତା ଏବଂ ପୋଷକ ତତ୍ତ୍ୱର ଉପଲବ୍ଧତାକୁ ଯଥେଷ୍ଟ ଉନ୍ନତ କରିପାରିବ |",
            ]
        }
    },
    # Default fallback responses for other topics to save space, but structured properly
    "general": {
         "keywords": ["help", "guide", "advice", "suggest", "madad", "sahayata", "krupa"],
         "responses": {
             "en": ["I'm here to help with your farming needs! You can ask me about crops, weather conditions, pest control, or market prices."],
             "hi": ["मैं आपकी खेती की ज़रूरतों में मदद करने के लिए यहाँ हूँ! आप मुझसे फसलों, मौसम की स्थिति, कीट नियंत्रण या बाजार की कीमतों के बारे में पूछ सकते हैं।"],
             "or": ["ମୁଁ ଆପଣଙ୍କ ଚାଷ ସମ୍ବନ୍ଧୀୟ ଆବଶ୍ୟକତାରେ ସାହାଯ୍ୟ କରିବାକୁ ଏଠାରେ ଅଛି! ଆପଣ ମୋତେ ଫସଲ, ପାଣିପାଗ ପରିସ୍ଥିତି, କୀଟ ନିୟନ୍ତ୍ରଣ କିମ୍ବା ବଜାର ଦର ବିଷୟରେ ପଚାରିପାରିବେ |"]
         }
    }
}

# ---------------------------------------------------------------------------
# Conversational patterns
# ---------------------------------------------------------------------------

GREETING_PATTERNS = [
    r"\b(hi|hello|hey|namaste|namaskar|greetings|good\s*morning|good\s*afternoon|good\s*evening|howdy|hola)\b",
]

FAREWELL_PATTERNS = [
    r"\b(bye|goodbye|see\s*you|thank\s*you.*bye|alvida|tata|take\s*care|good\s*night)\b",
]

THANKS_PATTERNS = [
    r"\b(thanks|thank\s*you|dhanyavaad|shukriya|appreciated|helpful)\b",
]

# Multilingual generic responses
GENERIC_RESPONSES = {
    "greeting": {
        "en": ["Namaste! 🙏 Welcome to SmartCrop Assistant. How can I help you today?", "Hello! 👋 I'm your SmartCrop farming assistant. What would you like to know about?"],
        "hi": ["नमस्ते! 🙏 स्मार्टक्रॉप सहायक में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूँ?", "नमस्ते! 👋 मैं आपका स्मार्टक्रॉप कृषि सहायक हूँ। आप किस बारे में जानना चाहेंगे?"],
        "or": ["ନମସ୍କାର! 🙏 ସ୍ମାର୍ଟକ୍ରପ୍ ସହାୟକକୁ ସ୍ୱାଗତ | ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?", "ନମସ୍କାର! 👋 ମୁଁ ଆପଣଙ୍କର ସ୍ମାର୍ଟକ୍ରପ୍ କୃଷି ସହାୟକ | ଆପଣ କ'ଣ ଜାଣିବାକୁ ଚାହୁଁଛନ୍ତି?"]
    },
    "farewell": {
        "en": ["Goodbye! 🙏 Wishing you a great harvest. Come back anytime!", "Take care! 🌾 Jai Kisan!"],
        "hi": ["अलविदा! 🙏 आपको अच्छी फसल की शुभकामनाएं।", "अपना ख्याल रखें! 🌾 जय किसान!"],
        "or": ["ବିଦାୟ! 🙏 ଆପଣଙ୍କର ଭଲ ଅମଳ ହେଉ |", "ନିଜର ଯତ୍ନ ନିଅନ୍ତୁ! 🌾 ଜୟ କିଷାନ!"]
    },
    "thanks": {
         "en": ["You're welcome! 😊", "Happy to help! 🌱"],
         "hi": ["आपका स्वागत है! 😊", "मदद करके खुशी हुई! 🌱"],
         "or": ["ଆପଣଙ୍କୁ ସ୍ୱାଗତ! 😊", "ସାହାଯ୍ୟ କରି ଖୁସି! 🌱"]
    },
    "fallback": {
        "en": [
            "That's an interesting question! Could you tell me more about what specific farming topic you'd like advice on? (e.g. Weather, Crops, Pests, Soil)",
            "I'd love to help you with that! To give you the best advice, could you share more details?"
        ],
        "hi": [
            "यह एक दिलचस्प सवाल है! क्या आप मुझे बता सकते हैं कि आप किस विशिष्ट खेती के विषय पर सलाह चाहते हैं? (जैसे मौसम, फसलें, कीट, मिट्टी)",
            "मुझे इसमें आपकी मदद करने में खुशी होगी! आपको सबसे अच्छी सलाह देने के लिए, क्या आप अधिक विवरण साझा कर सकते हैं?"
        ],
        "or": [
            "ଏହା ଏକ ଆଗ୍ରହଜନକ ପ୍ରଶ୍ନ! ଦୟାକରି ଆପଣ କେଉଁ ନିର୍ଦ୍ଦିଷ୍ଟ କୃଷି ବିଷୟ ଉପରେ ପରାମର୍ଶ ଚାହୁଁଛନ୍ତି ତାହା ମୋତେ କହିପାରିବେ କି? (ଉଦାହରଣ: ପାଣିପାଗ, ଫସଲ, କୀଟ, ମାଟି)",
            "ସେଥିରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବାକୁ ମୁଁ ବହୁତ ଖୁସି ହେବି! ଆପଣଙ୍କୁ ସର୍ବୋତ୍ତମ ପରାମର୍ଶ ଦେବାକୁ, ଦୟାକରି ଅଧିକ ବିବରଣୀ ଦେବେ କି?"
        ]
    }
}


def generate_response(message: str, history: list = None, language: str = "en") -> str:
    """
    Generate a contextual response to the farmer's message in the selected language.
    """
    msg = message.strip()
    msg_lower = msg.lower()

    # Ensure language is valid, default to english
    if language not in ["en", "hi", "or"]:
        language = "en"

    # 1. Check greetings
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, msg_lower):
            if "?" in msg or len(msg_lower.split()) > 5:
                topic_response = _match_topic(msg_lower, language)
                if topic_response:
                    return topic_response
            return random.choice(GENERIC_RESPONSES["greeting"][language])

    # 2. Check farewells
    for pattern in FAREWELL_PATTERNS:
        if re.search(pattern, msg_lower):
            return random.choice(GENERIC_RESPONSES["farewell"][language])

    # 3. Check thanks
    for pattern in THANKS_PATTERNS:
        if re.search(pattern, msg_lower):
            return random.choice(GENERIC_RESPONSES["thanks"][language])

    # 4. Match agricultural topics
    topic_response = _match_topic(msg_lower, language)
    if topic_response:
        return topic_response

    # 5. Fallback
    return random.choice(GENERIC_RESPONSES["fallback"][language])


def _match_topic(msg_lower: str, language: str) -> str | None:
    matched_topics = []

    for topic_name, topic_data in KNOWLEDGE_BASE.items():
        keyword_count = sum(1 for kw in topic_data["keywords"] if kw in msg_lower)
        if keyword_count > 0:
            matched_topics.append((topic_name, keyword_count))

    if not matched_topics:
        return None

    matched_topics.sort(key=lambda x: x[1], reverse=True)
    best_topic = matched_topics[0][0]

    return random.choice(KNOWLEDGE_BASE[best_topic]["responses"].get(language, KNOWLEDGE_BASE[best_topic]["responses"]["en"]))
