import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group, Circle
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.lineplots import LinePlot

def create_demo_pdf(output_path: str) -> str:
    """Generates the realistic 6-page corporate operations report matching Hackathon criteria."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=14,
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )
    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e3a8a"),
        backColor=colors.HexColor("#eff6ff"),
        borderPadding=10,
        spaceBefore=8,
        spaceAfter=12
    )

    story = []

    # ================= PAGE 1: EXECUTIVE SUMMARY =================
    story.append(Paragraph("AeroTech Global Manufacturing Corp", title_style))
    story.append(Paragraph("Annual Operations & Performance Review — Fiscal 2025", h2_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Executive Summary & Leadership Overview</b><br/>"
        "During Fiscal 2025, AeroTech executed a company-wide manufacturing modernization program across its primary production assembly lines. "
        "The primary strategic objective was accelerating delivery velocity while compressing cycle times. "
        "Capital allocations were concentrated into two priority pillars: precision robotic automated tooling cells installed during late Q2, "
        "and a rigorous 40-hour Level-2 technician upskilling curriculum completed across core assembly personnel.<br/><br/>"
        "As a direct outcome of these targeted investments, factory throughput expanded from 9,500 units in Q1 to an unprecedented peak of 13,000 units in Q4. "
        "Concurrently, overall plant production efficiency progressed from 78% in Q1 to 94% in Q4, representing an overall 16 percentage point gain across the fiscal cycle. "
        "Management notes that efficiency gains accelerated decisively following automated cell installation and workforce upskilling in Q2.",
        body_style
    ))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "<b>Key Operational Takeaways</b><br/>"
        "• <b>Production Scale:</b> Total annual production reached 44,300 precision components, beating guidance by 5.4%.<br/>"
        "• <b>Efficiency Acceleration:</b> Q4 recorded 94% operating efficiency, the highest recorded in company history.<br/>"
        "• <b>Identified Vulnerabilities:</b> Unplanned machine downtime averaged 18.0 hours per month, largely driven by Assembly Line 2 bearing fatigue.<br/>"
        "• <b>Quality Benchmarks:</b> First-pass yield stabilized at 97.4% in Q4 following temporary defect variance in Q3.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 2: PRODUCTION TABLE =================
    story.append(Paragraph("Quarterly Production Breakdown", title_style))
    story.append(Paragraph("Unit Volumes, Targets, and Line Distribution (Page 2)", h2_style))
    story.append(Paragraph(
        "The following table reflects audited production quantities by fiscal quarter across primary manufacturing lines. "
        "All figures represent verified finished goods passing final inspection.",
        body_style
    ))
    story.append(Spacer(1, 15))

    prod_data = [
        ["Quarter", "Target Output", "Actual Output", "Variance (Units)", "Fulfillment %", "Primary Line 1", "Assembly Line 2"],
        ["Q1 2025", "10,000", "9,500", "-500", "95.0%", "5,200", "4,300"],
        ["Q2 2025", "10,200", "10,000", "-200", "98.0%", "5,450", "4,550"],
        ["Q3 2025", "11,500", "11,800", "+300", "102.6%", "6,300", "5,500"],
        ["Q4 2025", "12,200", "13,000", "+800", "106.5%", "7,100", "5,900"],
        ["Full Year", "43,900", "44,300", "+400", "100.9%", "24,050", "20,250"]
    ]
    t_prod = Table(prod_data, colWidths=[65, 80, 80, 80, 75, 75, 75])
    t_prod.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
    ]))
    story.append(t_prod)
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "<b>Auditor Note:</b> Q4 production of 13,000 units represents a 3,000-unit increase (+30.0%) compared to Q2 output of 10,000 units. "
        "Production fulfillment accelerated by 8.5 percentage points between Q2 and Q4.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 3: EFFICIENCY TREND CHART =================
    story.append(Paragraph("Production Efficiency Analysis", title_style))
    story.append(Paragraph("Quarterly Operational Efficiency Benchmark (%) — Page 3", h2_style))
    story.append(Paragraph(
        "Operational efficiency is calculated as standard productive operating hours divided by total clocked factory labor hours. "
        "Target baseline for high-yield facilities is established at 85.0%.",
        body_style
    ))
    story.append(Spacer(1, 15))

    # Vector Bar Chart
    d_eff = Drawing(480, 200)
    bc_eff = VerticalBarChart()
    bc_eff.x = 40
    bc_eff.y = 25
    bc_eff.height = 140
    bc_eff.width = 400
    bc_eff.data = [[78, 82, 88, 94]]
    bc_eff.categoryAxis.categoryNames = ['Q1 (78%)', 'Q2 (82%)', 'Q3 (88%)', 'Q4 (94%)']
    bc_eff.categoryAxis.labels.fontSize = 9
    bc_eff.valueAxis.valueMin = 60
    bc_eff.valueAxis.valueMax = 100
    bc_eff.valueAxis.valueStep = 10
    bc_eff.bars[0].fillColor = colors.HexColor("#4f46e5")
    d_eff.add(bc_eff)
    story.append(d_eff)

    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Visual Evidence Summary — Production Efficiency:</b><br/>"
        "• <b>Q1:</b> 78% (Baseline prior to automation initiatives)<br/>"
        "• <b>Q2:</b> 82% (Early commissioning phase of robotic cells)<br/>"
        "• <b>Q3:</b> 88% (Integration post-training graduation)<br/>"
        "• <b>Q4:</b> 94% (Full operational stabilization — peak performance)<br/><br/>"
        "<b>Mathematical Delta:</b> Efficiency improved from 82% in Q2 to 94% in Q4, representing a delta of <b>12 percentage points</b>.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 4: DOWNTIME CHART =================
    story.append(Paragraph("Machine Downtime & Equipment Reliability", title_style))
    story.append(Paragraph("Root Cause Analysis & Unplanned Stoppages — Page 4", h2_style))
    story.append(Paragraph(
        "Unplanned equipment stoppage averages <b>18.0 hours per month</b> across the assembly facility. "
        "Analysis of line sensors and maintenance dispatch tickets reveals repeated component fatigue in Assembly Line 2.",
        body_style
    ))
    story.append(Spacer(1, 15))

    d_down = Drawing(480, 180)
    bc_down = VerticalBarChart()
    bc_down.x = 40
    bc_down.y = 25
    bc_down.height = 130
    bc_down.width = 400
    bc_down.data = [[10.4, 4.2, 2.1, 1.3]]
    bc_down.categoryAxis.categoryNames = ['Bearing Fatigue (58%)', 'Setup Delays (23%)', 'Sensor Faults (12%)', 'Misc (7%)']
    bc_down.categoryAxis.labels.fontSize = 8
    bc_down.valueAxis.valueMin = 0
    bc_down.valueAxis.valueMax = 12
    bc_down.valueAxis.valueStep = 2
    bc_down.bars[0].fillColor = colors.HexColor("#e11d48")
    d_down.add(bc_down)
    story.append(d_down)

    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Operational Risk Assessment:</b><br/>"
        "Unplanned downtime of 18.0 hours/month generates an annualized capacity loss of 216 operating hours. "
        "Bearing and spindle fatigue in Line 2 account for 10.4 hours/month (57.8% of all recorded line stops). "
        "Adopting scheduled predictive maintenance could potentially recover <b>3.6 hours/month</b> under a 20% downtime reduction scenario.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 5: TRAINING & WORKFORCE =================
    story.append(Paragraph("Workforce Enablement & Training Programs", title_style))
    story.append(Paragraph("Technical Certification and Operational Impacts — Page 5", h2_style))
    story.append(Paragraph(
        "In Q2 and Q3, AeroTech instituted a mandatory 40-hour hands-on curriculum: 'Level-2 Precision Robotics & Automated Maintenance'. "
        "A total of 142 plant technicians completed certification. "
        "The strategic purpose was resolving operator-driven variance and empowering front-line technicians to handle immediate micro-stoppages.",
        body_style
    ))
    story.append(Spacer(1, 15))

    train_data = [
        ["Cohort / Line", "Trained Operators", "Certification Rate", "Post-Training Yield", "Line Stop Incidents"],
        ["Line 1 - Shift A (Day)", "48", "96.0%", "98.2%", "3 per month"],
        ["Line 1 - Shift B (Night)", "42", "88.0%", "96.8%", "6 per month"],
        ["Line 2 - Shift A (Day)", "32", "84.0%", "97.1%", "8 per month"],
        ["Line 2 - Shift B (Night)", "20", "62.0%", "95.0%", "14 per month"],
        ["Total / Average", "142", "82.5%", "96.8%", "7.8 per month"]
    ]
    t_train = Table(train_data, colWidths=[120, 85, 85, 85, 95])
    t_train.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f766e")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f0fdfa")),
    ]))
    story.append(t_train)
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Strategic Correlation:</b> Operating shifts with certification rates over 85% demonstrated 38% fewer unplanned micro-stoppages. "
        "Night shift on Line 2 currently lags with 62.0% completion, directly correlating with lower first-pass yield.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 6: DEFECT & QUALITY TABLE =================
    story.append(Paragraph("Quality Assurance & Defect Analysis", title_style))
    story.append(Paragraph("Quarterly Inspection Metrics & Tolerance Audits — Page 6", h2_style))
    story.append(Paragraph(
        "AeroTech applies Six-Sigma statistical process controls across all machining operations. "
        "The table below details quarterly defect rates and primary failure categorizations.",
        body_style
    ))
    story.append(Spacer(1, 15))

    qual_data = [
        ["Quarter", "Parts Inspected", "Defects Found", "Defect Rate (%)", "First-Pass Yield", "Scrap Cost ($)"],
        ["Q1 2025", "9,800", "284", "2.90%", "97.1%", "$34,200"],
        ["Q2 2025", "10,350", "269", "2.60%", "97.4%", "$31,800"],
        ["Q3 2025", "12,100", "508", "4.20%", "95.8%", "$61,400"],
        ["Q4 2025", "13,350", "347", "2.60%", "97.4%", "$41,200"],
        ["Total", "45,600", "1,408", "3.09%", "96.9%", "$168,600"]
    ]
    t_qual = Table(qual_data, colWidths=[70, 85, 80, 80, 80, 75])
    t_qual.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#7c2d12")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#fff7ed")),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    story.append(t_qual)
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "<b>Quality Anomaly Finding:</b> Defect rates spiked to 4.20% during Q3 due to sensor drift during robotic cell commissioning. "
        "Following recalibration in late August, Q4 defect rates returned to baseline 2.60%, stabilizing scrap costs.",
        callout_style
    ))

    # Build PDF document
    doc.build(story)
    return output_path

if __name__ == "__main__":
    demo_pdf_path = "backend/demo_data/Global_Operations_Report_2025.pdf"
    create_demo_pdf(demo_pdf_path)
    print(f"Generated realistic 6-page demo PDF at: {demo_pdf_path}")
