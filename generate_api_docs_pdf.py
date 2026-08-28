import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "SmartCrop — API Architecture & Reference Manual")
            self.drawRightString(612 - 54, 750, "Confidential & Proprietary")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "SmartCrop — AI Agricultural Advisory & Monitoring System")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="SmartCrop_API_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#166534")      # Forest Green
    PRIMARY_LIGHT = colors.HexColor("#dcfce7")
    SECONDARY = colors.HexColor("#1e40af")    # Navy Blue
    SECONDARY_LIGHT = colors.HexColor("#dbeafe")
    TEXT_DARK = colors.HexColor("#0f172a")    # Slate 900
    TEXT_MUTED = colors.HexColor("#475569")   # Slate 600
    BG_LIGHT = colors.HexColor("#f8fafc")     # Slate 50
    BORDER_COLOR = colors.HexColor("#cbd5e1") # Slate 300
    METHOD_POST = colors.HexColor("#15803d")  # Green
    METHOD_GET = colors.HexColor("#0369a1")   # Sky blue
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=TEXT_MUTED,
        alignment=TA_LEFT
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    body_muted = ParagraphStyle(
        'Body_Muted',
        parent=body_style,
        textColor=TEXT_MUTED
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#094c25")
    )

    badge_post = ParagraphStyle(
        'Badge_POST',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=9,
        textColor=METHOD_POST,
        alignment=TA_CENTER
    )

    badge_get = ParagraphStyle(
        'Badge_GET',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=9,
        textColor=METHOD_GET,
        alignment=TA_CENTER
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # --- Title & Banner Header ---
    story.append(Paragraph("SmartCrop API Reference Manual", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Complete Technical Specification & API Documentation for Backend Endpoints, Browser Web APIs, and Integrated Services", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=12))

    # Meta Information Box
    meta_data = [
        [
            Paragraph("<b>Base URL:</b> <code>http://localhost:8000/api</code>", body_style),
            Paragraph("<b>Framework:</b> FastAPI (Python 3.14)", body_style),
            Paragraph("<b>Database:</b> SQLite + SQLAlchemy ORM", body_style)
        ],
        [
            Paragraph("<b>Frontend:</b> React + Vite + Tailwind CSS", body_style),
            Paragraph("<b>Authentication:</b> OTP / Token & Session Auth", body_style),
            Paragraph("<b>API Docs:</b> <code>/docs</code> (Swagger UI)", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[170, 170, 164])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 1: BACKEND REST APIS
    # =========================================================================
    story.append(Paragraph("1. Backend REST API Endpoints", h1_style))
    story.append(Paragraph("The backend provides high-performance, asynchronous RESTful endpoints powering farmer authentication, distress calculation, crop advisory, chatbot interaction, and agricultural monitoring.", body_muted))
    story.append(Spacer(1, 8))

    def create_api_table(endpoint_data):
        table_rows = [
            [
                Paragraph("Method", table_header),
                Paragraph("Endpoint", table_header),
                Paragraph("Description & Purpose", table_header),
                Paragraph("Payload / Parameters", table_header)
            ]
        ]
        for row in endpoint_data:
            method_badge = Paragraph(f"<b>{row['method']}</b>", badge_post if row['method'] == 'POST' else badge_get)
            endpoint_p = Paragraph(f"<code>{row['endpoint']}</code>", code_style)
            desc_p = Paragraph(row['desc'], body_style)
            payload_p = Paragraph(f"<code>{row['payload']}</code>", code_style)
            table_rows.append([method_badge, endpoint_p, desc_p, payload_p])

        t = Table(table_rows, colWidths=[48, 130, 166, 160])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        return t

    # 1.1 Authentication
    story.append(Paragraph("1.1 Authentication & Access Control", h2_style))
    auth_endpoints = [
        {
            "method": "POST",
            "endpoint": "/auth/request-otp",
            "desc": "Requests an OTP for farmer mobile login. Generates mock 4-digit OTP ('1234') in development mode.",
            "payload": '{"phone": "9876543210"}'
        },
        {
            "method": "POST",
            "endpoint": "/auth/verify-otp",
            "desc": "Validates the 4-digit OTP for the specified phone and returns a bearer authentication token.",
            "payload": '{"phone": "9876543210",\n "otp": "1234"}'
        },
        {
            "method": "POST",
            "endpoint": "/auth/officer-login",
            "desc": "Authenticates agricultural department officers with username/password credentials.",
            "payload": '{"username": "admin",\n "password": "123"}'
        }
    ]
    story.append(create_api_table(auth_endpoints))
    story.append(Spacer(1, 10))

    # 1.2 Farmer & Records
    story.append(Paragraph("1.2 Farmer Profiles & Agricultural Records", h2_style))
    farmer_endpoints = [
        {
            "method": "GET",
            "endpoint": "/farmers/",
            "desc": "Lists registered farmers with optional pagination offset and limit query parameters.",
            "payload": "Params: skip=0, limit=100"
        },
        {
            "method": "POST",
            "endpoint": "/farmers/",
            "desc": "Creates and registers a new farmer profile with regional, crop, soil, and financial data.",
            "payload": '{"name": "Ramesh",\n "phone": "9876543210",\n "district": "Pune",\n "crop": "Wheat",\n "soil_type": "Black",\n "loan_amount": 50000,\n "days_to_loan_due": 180}'
        },
        {
            "method": "POST",
            "endpoint": "/farmers/{id}/records/",
            "desc": "Adds a climate & price record for farmer ID, automatically calculating the Distress Risk Score (0-100).",
            "payload": '{"rainfall_deviation_percent": -25.0,\n "mandi_price_drop_percent": 15.0}'
        }
    ]
    story.append(create_api_table(farmer_endpoints))
    story.append(Spacer(1, 10))

    # 1.3 Advisory & Chat
    story.append(Paragraph("1.3 Advisory Engine & AI Voice/Chat Assistant", h2_style))
    advisory_endpoints = [
        {
            "method": "POST",
            "endpoint": "/advisory/",
            "desc": "Generates agronomic advice based on crop type, soil composition, rainfall variance, and preferred language.",
            "payload": '{"crop": "Wheat",\n "soil_type": "Black Soil",\n "rainfall_deviation_percent": -20,\n "language": "hi"}'
        },
        {
            "method": "POST",
            "endpoint": "/chat",
            "desc": "AI conversational endpoint handling farmer questions about mandi rates, rain forecast, and pest control.",
            "payload": '{"message": "What is the mandi price for wheat?"}'
        }
    ]
    story.append(create_api_table(advisory_endpoints))
    story.append(Spacer(1, 10))

    # 1.4 Dashboard & Alerts
    story.append(Paragraph("1.4 Officer Distress Dashboard & Automated Alerts", h2_style))
    officer_endpoints = [
        {
            "method": "GET",
            "endpoint": "/dashboard-data/",
            "desc": "Aggregates total farmers, counts high-risk profiles (Distress Score > 60), and returns ranked risk cases.",
            "payload": "Response: {total_farmers,\n high_risk_count,\n high_risk_farmers: [...]}"
        },
        {
            "method": "POST",
            "endpoint": "/alert/{farmer_id}",
            "desc": "Triggers an automated SMS distress alert to the farmer's registered phone and alerts regional officers.",
            "payload": "Path param: farmer_id (int)"
        }
    ]
    story.append(create_api_table(officer_endpoints))
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: BROWSER CLIENT-SIDE WEB APIS
    # =========================================================================
    story.append(KeepTogether([
        Paragraph("2. Browser Client-Side Web APIs", h1_style),
        Paragraph("The frontend leverages native browser Web APIs to provide high-accessibility voice capabilities for farmers in regional languages and persistent state management.", body_muted),
        Spacer(1, 8)
    ]))

    browser_apis = [
        [
            Paragraph("API Name", table_header),
            Paragraph("Interface / Constructor", table_header),
            Paragraph("Implementation & Feature Usage", table_header),
            Paragraph("Supported Locales", table_header)
        ],
        [
            Paragraph("<b>Speech Recognition</b>", body_style),
            Paragraph("<code>SpeechRecognition</code> /<br/><code>webkitSpeechRecognition</code>", code_style),
            Paragraph("Powers real-time <b>Speech-to-Text (STT)</b> microphone input in <code>FarmerChat.jsx</code>.", body_style),
            Paragraph("<code>en-IN</code> (English India)<br/><code>hi-IN</code> (Hindi)<br/><code>or-IN</code> (Odia)", code_style)
        ],
        [
            Paragraph("<b>Speech Synthesis</b>", body_style),
            Paragraph("<code>window.speechSynthesis</code><br/><code>SpeechSynthesisUtterance</code>", code_style),
            Paragraph("Provides <b>'Read Aloud' (TTS)</b> voice feedback for assistant responses with Indian-accent voices.", body_style),
            Paragraph("Matches active app language (English, Hindi, Odia)", body_style)
        ],
        [
            Paragraph("<b>Web Storage API</b>", body_style),
            Paragraph("<code>window.localStorage</code>", code_style),
            Paragraph("Persists session tokens (<code>token</code>, <code>officerToken</code>) and recent phone/username history.", body_style),
            Paragraph("Client-side storage", body_style)
        ]
    ]

    b_table = Table(browser_apis, colWidths=[100, 130, 184, 90])
    b_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(b_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 3: EXTERNAL SERVICES & ALGORITHM
    # =========================================================================
    story.append(KeepTogether([
        Paragraph("3. External Services & Distress Formula", h1_style),
        Paragraph("<b>Google Translate Service (<code>googletrans</code>):</b> Integrated into <code>advisory_engine.py</code> to deliver multi-language agricultural advice dynamically.", body_style),
        Spacer(1, 6),
        Paragraph("<b>Distress Scoring Algorithm:</b> Calculates farmer vulnerability (0–100) using weighted multi-factor normalization:", body_style),
        Spacer(1, 6),
        Table([
            [
                Paragraph("<b>Factor</b>", table_header),
                Paragraph("<b>Weight</b>", table_header),
                Paragraph("<b>Normalization Metric</b>", table_header),
                Paragraph("<b>Distress Trigger Threshold</b>", table_header)
            ],
            [
                Paragraph("Rainfall Deficit", body_style),
                Paragraph("<b>40% (0.4)</b>", body_style),
                Paragraph("<code>min(max(-rainfall_dev, 0), 50) / 50.0</code>", code_style),
                Paragraph("Severe deficit below -20% to -50%", body_style)
            ],
            [
                Paragraph("Mandi Price Drop", body_style),
                Paragraph("<b>40% (0.4)</b>", body_style),
                Paragraph("<code>min(max(price_drop, 0), 30) / 30.0</code>", code_style),
                Paragraph("Price drop exceeds 15% to 30%", body_style)
            ],
            [
                Paragraph("Loan Due Proximity", body_style),
                Paragraph("<b>20% (0.2)</b>", body_style),
                Paragraph("<code>max(365 - days_to_loan, 0) / 365.0</code>", code_style),
                Paragraph("Due date approaching 0–30 days", body_style)
            ],
            [
                Paragraph("<b>Total Score</b>", body_style),
                Paragraph("<b>100%</b>", body_style),
                Paragraph("<b>Risk = (0.4·Rain + 0.4·Price + 0.2·Loan) × 100</b>", body_style),
                Paragraph("<b>Score > 60: Flagged as High Risk</b>", body_style)
            ]
        ], colWidths=[90, 64, 190, 160], style=[
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, BG_LIGHT]),
            ('BACKGROUND', (0, -1), (-1, -1), PRIMARY_LIGHT),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ])
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    build_pdf("c:\\Users\\Kritesh Mantry\\OneDrive\\Desktop\\PROJECTS\\SmartCrop\\SmartCrop_API_Documentation.pdf")
