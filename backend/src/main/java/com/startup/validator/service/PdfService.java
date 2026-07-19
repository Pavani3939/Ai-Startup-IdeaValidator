package com.startup.validator.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.startup.validator.entity.AnalysisReport;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    public byte[] generateReportPdf(AnalysisReport report) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, new java.awt.Color(79, 70, 229));
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new java.awt.Color(30, 41, 59));
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new java.awt.Color(100, 116, 139));
            Font greenFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new java.awt.Color(34, 197, 94));
            Font redFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new java.awt.Color(239, 68, 68));
            Font orangeFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new java.awt.Color(245, 158, 11));

            // Title
            Paragraph title = new Paragraph("Startup Idea Analysis Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));
            
            // Idea Details
            document.add(new Paragraph("Idea Title: " + report.getStartupIdea().getTitle(), headingFont));
            document.add(new Paragraph("Industry: " + report.getStartupIdea().getIndustry(), textFont));
            document.add(new Paragraph("Description: " + report.getStartupIdea().getDescription(), textFont));
            document.add(new Paragraph(" "));

            // Score
            document.add(new Paragraph("Success Score: " + report.getSuccessScore() + "/10", headingFont));
            document.add(new Paragraph(" "));

            // Summary
            document.add(new Paragraph("Summary", headingFont));
            document.add(new Paragraph(report.getSummary(), textFont));
            document.add(new Paragraph(" "));

            // Market Potential
            document.add(new Paragraph("Market Potential", headingFont));
            document.add(new Paragraph(report.getMarketPotential(), textFont));
            document.add(new Paragraph(" "));

            // Advantages
            document.add(new Paragraph("Advantages", headingFont));
            com.lowagie.text.List advantagesList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            for (String adv : report.getAdvantages()) {
                advantagesList.add(new ListItem(adv, greenFont));
            }
            document.add(advantagesList);
            document.add(new Paragraph(" "));

            // Disadvantages
            document.add(new Paragraph("Disadvantages", headingFont));
            com.lowagie.text.List disadvantagesList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            for (String dis : report.getDisadvantages()) {
                disadvantagesList.add(new ListItem(dis, redFont));
            }
            document.add(disadvantagesList);
            document.add(new Paragraph(" "));

            // Suggestions
            document.add(new Paragraph("Improvement Suggestions", headingFont));
            com.lowagie.text.List suggestionsList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            for (String sug : report.getImprovementSuggestions()) {
                suggestionsList.add(new ListItem(sug, orangeFont));
            }
            document.add(suggestionsList);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
