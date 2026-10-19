package com.startup.validator.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.entity.FinancialProjection;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.repository.FinancialProjectionRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class PdfService {

    private final FinancialProjectionRepository financialRepository;

    public PdfService(FinancialProjectionRepository financialRepository) {
        this.financialRepository = financialRepository;
    }

    public byte[] generateReportPdf(AnalysisReport report) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 46, 46);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfPageEventHandler());
            document.open();

            // Color palette from design system
            Color primaryColor = new Color(79, 70, 229);    // #4F46E5
            Color textPrimary = new Color(15, 23, 42);      // #0F172A
            Color textSecondary = new Color(71, 85, 105);   // #475569
            Color successColor = new Color(22, 163, 74);    // #16A34A
            Color errorColor = new Color(220, 38, 38);      // #DC2626
            Color warningColor = new Color(217, 119, 6);    // #D97706
            Color bgSecondary = new Color(241, 245, 249);   // #F1F5F9

            // Fonts
            Font headerTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor);
            Font subHeadingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, textPrimary);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, textPrimary);
            Font smallMutedFont = FontFactory.getFont(FontFactory.HELVETICA, 8, textSecondary);
            Font scoreFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, primaryColor);

            StartupIdea idea = report.getStartupIdea();
            String title = idea != null ? idea.getTitle() : "Startup Idea";
            String industry = idea != null ? idea.getIndustry() : "Technology";
            int readiness = report.getReadinessScore() != null ? report.getReadinessScore() : (report.getSuccessScore() != null ? report.getSuccessScore() * 10 : 70);

            // 1. Report Header / Cover Banner
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{70, 30});

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("AI Startup Idea Evaluation", headerTitleFont));
            leftCell.addElement(new Paragraph("Project: " + title + "  |  Industry: " + industry, subHeadingFont));
            leftCell.addElement(new Paragraph("Date: " + LocalDate.now().toString() + "  |  Platform: AI Startup Idea Validator", smallMutedFont));
            headerTable.addCell(leftCell);

            PdfPCell scoreCell = new PdfPCell();
            scoreCell.setBorder(Rectangle.BOX);
            scoreCell.setBorderColor(primaryColor);
            scoreCell.setBackgroundColor(bgSecondary);
            scoreCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            scoreCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph scoreLabel = new Paragraph("READINESS SCORE", smallMutedFont);
            scoreLabel.setAlignment(Element.ALIGN_CENTER);
            scoreCell.addElement(scoreLabel);
            Paragraph scoreVal = new Paragraph(readiness + "/100", scoreFont);
            scoreVal.setAlignment(Element.ALIGN_CENTER);
            scoreCell.addElement(scoreVal);
            headerTable.addCell(scoreCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Disclaimer banner
            PdfPTable noticeTable = new PdfPTable(1);
            noticeTable.setWidthPercentage(100);
            PdfPCell noticeCell = new PdfPCell(new Phrase("Notice: This report provides an indicative readiness assessment based on heuristic and AI-assisted qualitative modeling. It does not constitute a guaranteed commercial success rate, legal counsel, or financial advice.", smallMutedFont));
            noticeCell.setBackgroundColor(new Color(238, 242, 255));
            noticeCell.setBorderColor(new Color(199, 210, 254));
            noticeCell.setPadding(6);
            noticeTable.addCell(noticeCell);
            document.add(noticeTable);
            document.add(new Paragraph(" "));

            // 2. Executive Summary
            document.add(new Paragraph("1. Executive Summary", sectionTitleFont));
            String summaryText = report.getExecutiveSummary() != null && !report.getExecutiveSummary().isBlank()
                    ? report.getExecutiveSummary()
                    : (report.getSummary() != null ? report.getSummary() : "Comprehensive concept review in progress.");
            document.add(new Paragraph(summaryText, bodyFont));
            document.add(new Paragraph(" "));

            // 3. Score Explanation
            if (report.getScoreExplanation() != null && !report.getScoreExplanation().isBlank()) {
                document.add(new Paragraph("2. Score Methodology & Explanation", sectionTitleFont));
                document.add(new Paragraph(report.getScoreExplanation(), bodyFont));
                document.add(new Paragraph(" "));
            }

            // 4. Market Assessment
            String marketText = report.getMarketAssessment() != null && !report.getMarketAssessment().isBlank()
                    ? report.getMarketAssessment()
                    : report.getMarketPotential();
            if (marketText != null && !marketText.isBlank()) {
                document.add(new Paragraph("3. Market & Audience Assessment", sectionTitleFont));
                document.add(new Paragraph(marketText, bodyFont));
                document.add(new Paragraph(" "));
            }

            // 5. SWOT Analysis
            document.add(new Paragraph("4. SWOT Matrix", sectionTitleFont));
            PdfPTable swotTable = new PdfPTable(2);
            swotTable.setWidthPercentage(100);
            swotTable.setSpacingBefore(6);

            addSwotCell(swotTable, "Strengths (Internal)", report.getStrengths() != null ? report.getStrengths() : report.getAdvantages(), successColor, bodyFont);
            addSwotCell(swotTable, "Weaknesses (Internal)", report.getWeaknesses() != null ? report.getWeaknesses() : report.getDisadvantages(), errorColor, bodyFont);
            addSwotCell(swotTable, "Opportunities (External)", report.getOpportunities(), primaryColor, bodyFont);
            addSwotCell(swotTable, "Threats (External)", report.getThreats(), warningColor, bodyFont);

            document.add(swotTable);
            document.add(new Paragraph(" "));

            // 6. Evaluation Dimensions
            if (report.getEvaluationDimensions() != null && !report.getEvaluationDimensions().isEmpty()) {
                document.add(new Paragraph("5. Core Evaluation Dimensions", sectionTitleFont));
                PdfPTable dimTable = new PdfPTable(3);
                dimTable.setWidthPercentage(100);
                dimTable.setWidths(new float[]{25, 15, 60});
                dimTable.setSpacingBefore(6);

                addTableHeaderCell(dimTable, "Dimension", primaryColor);
                addTableHeaderCell(dimTable, "Score", primaryColor);
                addTableHeaderCell(dimTable, "Key Finding & Recommendation", primaryColor);

                for (Map<String, Object> dim : report.getEvaluationDimensions()) {
                    String dimName = String.valueOf(dim.getOrDefault("dimension", "Core"));
                    String dimScore = String.valueOf(dim.getOrDefault("score", "-")) + "/100";
                    String rec = String.valueOf(dim.getOrDefault("explanation", "")) + " " + String.valueOf(dim.getOrDefault("recommendation", ""));

                    dimTable.addCell(new Phrase(dimName, subHeadingFont));
                    dimTable.addCell(new Phrase(dimScore, bodyFont));
                    dimTable.addCell(new Phrase(rec.trim(), bodyFont));
                }
                document.add(dimTable);
                document.add(new Paragraph(" "));
            }

            // 7. Key Risks & Mitigations
            if (report.getRisks() != null && !report.getRisks().isEmpty()) {
                document.add(new Paragraph("6. Key Strategic Risks & Mitigation", sectionTitleFont));
                PdfPTable riskTable = new PdfPTable(3);
                riskTable.setWidthPercentage(100);
                riskTable.setWidths(new float[]{20, 40, 40});
                riskTable.setSpacingBefore(6);

                addTableHeaderCell(riskTable, "Severity / Category", primaryColor);
                addTableHeaderCell(riskTable, "Risk Description", primaryColor);
                addTableHeaderCell(riskTable, "Mitigation Action", primaryColor);

                for (Map<String, Object> r : report.getRisks()) {
                    String sev = String.valueOf(r.getOrDefault("severity", "Medium")) + " (" + String.valueOf(r.getOrDefault("category", "General")) + ")";
                    String desc = String.valueOf(r.getOrDefault("description", ""));
                    String mit = String.valueOf(r.getOrDefault("mitigation", ""));

                    riskTable.addCell(new Phrase(sev, subHeadingFont));
                    riskTable.addCell(new Phrase(desc, bodyFont));
                    riskTable.addCell(new Phrase(mit, bodyFont));
                }
                document.add(riskTable);
                document.add(new Paragraph(" "));
            }

            // 8. Financial Feasibility (if calculated)
            if (idea != null) {
                financialRepository.findTopByStartupIdeaIdOrderByCreatedAtDesc(idea.getId()).ifPresent(fp -> {
                    try {
                        document.add(new Paragraph("7. Financial Feasibility Projections", sectionTitleFont));
                        PdfPTable finTable = new PdfPTable(4);
                        finTable.setWidthPercentage(100);
                        finTable.setSpacingBefore(6);

                        addTableHeaderCell(finTable, "Metric", primaryColor);
                        addTableHeaderCell(finTable, "Value", primaryColor);
                        addTableHeaderCell(finTable, "Metric", primaryColor);
                        addTableHeaderCell(finTable, "Value", primaryColor);

                        finTable.addCell(new Phrase("Initial Investment", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getInitialInvestment(), bodyFont));
                        finTable.addCell(new Phrase("Monthly Fixed Costs", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getMonthlyFixedCosts(), bodyFont));

                        finTable.addCell(new Phrase("Selling Price/Unit", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getSellingPricePerUnit(), bodyFont));
                        finTable.addCell(new Phrase("Variable Cost/Unit", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getVariableCostPerUnit(), bodyFont));

                        finTable.addCell(new Phrase("Expected Units", subHeadingFont));
                        finTable.addCell(new Phrase(String.valueOf(fp.getExpectedUnits()), bodyFont));
                        finTable.addCell(new Phrase("Estimated Revenue", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getEstimatedRevenue(), bodyFont));

                        finTable.addCell(new Phrase("Est. Operating Profit", subHeadingFont));
                        finTable.addCell(new Phrase("$" + fp.getEstimatedOperatingProfit(), bodyFont));
                        finTable.addCell(new Phrase("Operating Margin", subHeadingFont));
                        finTable.addCell(new Phrase(fp.getOperatingMarginPercent() != null ? fp.getOperatingMarginPercent() + "%" : "N/A", bodyFont));

                        finTable.addCell(new Phrase("Break-Even Units", subHeadingFont));
                        finTable.addCell(new Phrase(fp.getBreakEvenUnits() != null ? fp.getBreakEvenUnits() + " units" : "N/A", bodyFont));
                        finTable.addCell(new Phrase("Break-Even Revenue", subHeadingFont));
                        finTable.addCell(new Phrase(fp.getBreakEvenRevenue() != null ? "$" + fp.getBreakEvenRevenue() : "N/A", bodyFont));

                        document.add(finTable);
                        document.add(new Paragraph(" "));
                    } catch (DocumentException ignored) {}
                });
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return out.toByteArray();
    }

    private void addSwotCell(PdfPTable table, String title, List<String> items, Color headerColor, Font bodyFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, headerColor);
        cell.addElement(new Paragraph(title, titleFont));

        if (items != null && !items.isEmpty()) {
            com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            list.setListSymbol("• ");
            for (String item : items) {
                list.add(new ListItem(item, bodyFont));
            }
            cell.addElement(list);
        } else {
            cell.addElement(new Paragraph("None noted.", bodyFont));
        }

        table.addCell(cell);
    }

    private void addTableHeaderCell(PdfPTable table, String text, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        table.addCell(cell);
    }

    // Page number and footer handler
    private static class PdfPageEventHandler extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
            Phrase footer = new Phrase("AI Startup Idea Validator  |  Confidential  |  Page " + writer.getPageNumber(), footerFont);
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 15, 0);
        }
    }
}
