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
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD);
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Font.BOLD);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.NORMAL);

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
                advantagesList.add(new ListItem(adv, textFont));
            }
            document.add(advantagesList);
            document.add(new Paragraph(" "));

            // Disadvantages
            document.add(new Paragraph("Disadvantages", headingFont));
            com.lowagie.text.List disadvantagesList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            for (String dis : report.getDisadvantages()) {
                disadvantagesList.add(new ListItem(dis, textFont));
            }
            document.add(disadvantagesList);
            document.add(new Paragraph(" "));

            // Suggestions
            document.add(new Paragraph("Improvement Suggestions", headingFont));
            com.lowagie.text.List suggestionsList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            for (String sug : report.getImprovementSuggestions()) {
                suggestionsList.add(new ListItem(sug, textFont));
            }
            document.add(suggestionsList);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
