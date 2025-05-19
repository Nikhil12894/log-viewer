package com.nk.logviewer;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.core.Vertx;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseEventSink;

import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@ApplicationScoped
public class LogTailService {

    private static final int POLL_INTERVAL_MS = 1000;

    @Inject
    Vertx vertx;

    @Inject
    LogApplicationProperty logApplicationProperty;
    public void tailLogFile(String filePath, Sse sse, SseEventSink sink) {
        Path path = Paths.get(filePath).normalize();
        Path rootPath = Paths.get(logApplicationProperty.rootPathDirectory()).normalize();

        // Security check
        if (!path.startsWith(rootPath) || !Files.isRegularFile(path)) {
            sink.send(sse.newEvent("Access denied or invalid file."));
            sink.close();
            return;
        }

        ExecutorService executor = Executors.newSingleThreadExecutor();

        executor.submit(() -> {
            try (RandomAccessFile raf = new RandomAccessFile(path.toFile(), "r")) {
                long pointer = raf.length(); // Start from end of file

                while (!sink.isClosed()) {
                    long length = raf.length();
                    if (length > pointer) {
                        raf.seek(pointer);
                        String line;
                        while ((line = raf.readLine()) != null) {
                            Log.info("Sending line: " + line);  // DEBUG
                            sink.send(sse.newEvent(line));
                        }
                        pointer = raf.getFilePointer();
                    }
                    Thread.sleep(POLL_INTERVAL_MS);
                }
            } catch (Exception e) {
                if (!sink.isClosed()) {
                    sink.send(sse.newEvent("ERROR: " + e.getMessage()));
                }
            } finally {
                sink.close();
                executor.shutdown();
            }
        });
    }

}
