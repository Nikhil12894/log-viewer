package com.nk.logviewer;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.core.Vertx;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("/api")
public class GreetingResource {

    @Inject
    Vertx vertx;

    @Inject
    FileDirTreeService fileDirTreeService;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello RESTEasy";
    }


    @GET
    @Path("/dir-tree")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<List<TreeNodeData>> getDirectoryTree(
            @QueryParam("path") @DefaultValue("/Users/nalinkumar/Developer") String basePath,
            @QueryParam("maxDepth") @DefaultValue("3") int maxDepth

    ) {
        String normalized = basePath.replace("\\", "/");
        return fileDirTreeService.scanDirectoryRecursive(normalized, maxDepth);
    }


    @GET
    @Path("/baseDir")
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, String> getLogMetadata() {
        return Map.of("baseDir", fileDirTreeService.getBaseDir());
    }

//    @GET
//    @Path("/log-chunk")
//    public Response getLogChunk(@QueryParam("path") String filePath,
//                                @QueryParam("offset") @DefaultValue("0") int offset,
//                                @QueryParam("limit") @DefaultValue("100") int limit) {
//
//        java.nio.file.Path path = Paths.get(filePath);
//        if (!Files.exists(path) || Files.isDirectory(path)) {
//            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid file path").build();
//        }
//
//        try {
//            List<String> allLines = Files.readAllLines(path);
//            int totalLines = allLines.size();
//
//            // If file has fewer lines than the limit, return all lines
//            if (totalLines <= limit) {
//                return Response.ok(Map.of(
//                        "lines", allLines,
//                        "hasMore", false,
//                        "nextOffset", totalLines
//                )).build();
//            }
//
//            // Otherwise return paginated chunk
//            int toIndex = Math.min(offset + limit, totalLines);
//            List<String> chunk = allLines.subList(offset, toIndex);
//            boolean hasMore = toIndex < totalLines;
//
//            return Response.ok(Map.of(
//                    "lines", chunk,
//                    "hasMore", hasMore,
//                    "nextOffset", toIndex
//            )).build();
//
//        } catch (IOException e) {
//            return Response.serverError().entity("Failed to read file").build();
//        }
//    }

    @GET
    @Path("/log-chunk")
    public Response getLogChunk(@QueryParam("path") String filePath,
                                @QueryParam("offset") @DefaultValue("0") long offset,
                                @QueryParam("limit") @DefaultValue("100") int limit,
                                @QueryParam("bufferSize") @DefaultValue("8192") int bufferSize) {

        java.nio.file.Path path = Paths.get(filePath);
        if (!Files.exists(path) || Files.isDirectory(path)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid file path").build();
        }

        try {
            // Use buffered reader with file position tracking
            try (BufferedReader reader = Files.newBufferedReader(path)) {
                List<String> lines = new ArrayList<>(limit);
                long currentOffset = 0;
                String line;

                // Skip to the requested offset
                while (currentOffset < offset && (line = reader.readLine()) != null) {
                    currentOffset++;
                }

                // Read the requested number of lines
                while (lines.size() < limit && (line = reader.readLine()) != null) {
                    lines.add(line);
                    currentOffset++;
                }

                // Check if there are more lines available
                boolean hasMore = reader.readLine() != null;

                return Response.ok(Map.of(
                        "lines", lines,
                        "hasMore", hasMore,
                        "nextOffset", currentOffset
                )).build();
            }
        } catch (IOException e) {
            return Response.serverError().entity("Failed to read file: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/file-metadata")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<LogMetadata> getLogMetadata(@QueryParam("path") @DefaultValue("/Users/nalinkumar/Developer/argocd_repo/MyEditorApp-micro_frontend/editor-root.k8s.yaml") String path) {
        return vertx.fileSystem().props(path)
                .onItem().transform(props -> new LogMetadata(props.size(),props.lastModifiedTime(), path));
    }

    public static class LogMetadata {
        public final long size;
        public final long lastModified;
        public final String path;
        public LogMetadata(long size, long lastModified, String path) {
            this.size = size;
            this.lastModified = lastModified;
            this.path = path;
        }
    }

    @GET
    @Path("/download-file")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadFile(@QueryParam("path") String path) {
        if (path == null || path.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing 'path' parameter").build();
        }

        try {
            java.nio.file.Path filePath = Paths.get(path).normalize(); // consider validating the base dir
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                return Response.status(Response.Status.NOT_FOUND).entity("File not found").build();
            }

            InputStream fileStream = Files.newInputStream(filePath);
            String fileName = filePath.getFileName().toString();

            return Response.ok(fileStream)
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Failed to read file").build();
        }
    }

//    public static void main(String[] args) {
//        String logFilePath = "test-log.txt";
//        int totalLines = 100000;
//
//        try (BufferedWriter writer = new BufferedWriter(new FileWriter(logFilePath))) {
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
//
//            for (int i = 1; i <= totalLines; i++) {
//                String timestamp = LocalDateTime.now().format(formatter);
//                String level = switch (i % 5) {
//                    case 0 -> "INFO";
//                    case 1 -> "DEBUG";
//                    case 2 -> "WARN";
//                    case 3 -> "ERROR";
//                    default -> "TRACE";
//                };
//
//                writer.write(String.format("%s [%s] Line %05d: This is a sample log message with timestamp and level \n", timestamp, level, i));
//            }
//
//            System.out.println("Log file generated successfully at: " + logFilePath);
//
//        } catch (IOException e) {
//            System.err.println("Failed to write log file: " + e.getMessage());
//        }
//    }

}
