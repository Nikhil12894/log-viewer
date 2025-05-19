package com.nk.logviewer;

import java.time.Instant;
import java.util.List;
import java.util.Map;


public class AnalysisResult {
    private String filename;
    private Instant timestamp;
    private String analysisSummary;
    private List<String> criticalIssues;
    private List<String> recommendations;
    private Map<String, Object> statistics;
    
    // Getters and setters

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getAnalysisSummary() {
        return analysisSummary;
    }

    public void setAnalysisSummary(String analysisSummary) {
        this.analysisSummary = analysisSummary;
    }

    public List<String> getCriticalIssues() {
        return criticalIssues;
    }

    public void setCriticalIssues(List<String> criticalIssues) {
        this.criticalIssues = criticalIssues;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public Map<String, Object> getStatistics() {
        return statistics;
    }

    public void setStatistics(Map<String, Object> statistics) {
        this.statistics = statistics;
    }

}

