package com.nk.logviewer;

import ai.djl.inference.Predictor;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import io.quarkus.logging.Log;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.stream.Collectors;

@Path("/api/logs")
public class LogAnalysisResource {


    @Inject
    LogApplicationProperty applicationProperty;

    @POST
    @Path("/analyze")
    @Consumes(MediaType.TEXT_PLAIN)
    @Produces(MediaType.APPLICATION_JSON)
    public AnalysisResult analyzeLogs(String filePath) {
        // Validate and sanitize the file path
        java.nio.file.Path safePath = validateAndSanitizePath(filePath);
        
        // Read log file content
        String logContent = readLogFile(safePath);
        
        // Preprocess log content
        String processedLogs = preprocessLogs(logContent);
        
        // Call AI model
        String analysis = analyzeWithModel(processedLogs);
        
        // Generate report
        return generateReport(analysis, safePath.getFileName().toString());
    }

    private java.nio.file.Path validateAndSanitizePath(String filePath) {
        try {
            java.nio.file.Path requestedPath = Paths.get(filePath).normalize();
            java.nio.file.Path basePath = Paths.get(applicationProperty.rootPathDirectory()).normalize();
            
            // Security check to prevent directory traversal
            if (!requestedPath.startsWith(basePath)) {
                throw new SecurityException("Access to files outside log directory is prohibited");
            }
            
            // Check if file exists and is readable
            if (!Files.exists(requestedPath) || !Files.isReadable(requestedPath)) {
                throw new FileNotFoundException("Log file not found or not readable");
            }
            
            return requestedPath;
        } catch (InvalidPathException | FileNotFoundException e) {
            throw new BadRequestException("Invalid file path");
        }
    }

    private String readLogFile(java.nio.file.Path filePath) {
        try {
            return Files.readString(filePath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            Log.error("Failed to read log file: " + filePath, e);
            throw new RuntimeException("Failed to read log file", e);
        }
    }

    private String preprocessLogs(String rawLogs) {
        // Implement log preprocessing:
        // 1. Remove sensitive data
        // 2. Normalize timestamps
        // 3. Filter irrelevant lines
        // 4. Tokenize if needed
        
        return rawLogs.lines()
            .filter(line -> !line.contains("password") && !line.contains("secret"))
            .collect(Collectors.joining("\n"));
    }

    private String analyzeWithModel(String processedLogs) {
        try {
            Criteria<String, String> criteria = Criteria.builder()
                .setTypes(String.class, String.class)
                .optModelUrls("djl://ai.djl.huggingface.pytorch/distilbert-base-uncased")
                .optArgument("task", "text-classification")
                .build();

            try (ZooModel<String, String> model = criteria.loadModel();
                 Predictor<String, String> predictor = model.newPredictor()) {
                
                return predictor.predict(processedLogs);
            }
        } catch (Exception e) {
            Log.error("AI model processing failed", e);
            throw new RuntimeException("AI model processing failed", e);
        }
    }

    private AnalysisResult generateReport(String analysis, String filename) {
        // Create comprehensive report
        AnalysisResult report = new AnalysisResult();
        report.setFilename(filename);
        report.setTimestamp(Instant.now());
        report.setAnalysisSummary(analysis);
        
        // Add additional insights
//        report.setCriticalIssues(extractCriticalIssues(analysis));
//        report.setRecommendations(generateRecommendations(analysis));
//        report.setStatistics(computeStatistics(analysis));
        
        return report;
    }
    
    // Additional helper methods...
}