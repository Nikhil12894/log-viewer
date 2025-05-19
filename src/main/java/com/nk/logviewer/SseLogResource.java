package com.nk.logviewer;

import io.vertx.mutiny.core.Vertx;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseEventSink;

@jakarta.ws.rs.Path("/logs")
public class SseLogResource {

    private static final String LOG_FILE_PATH = "/Users/nalinkumar/Developer/argocd_repo/MyEditorApp-micro_frontend/editor-root.k8s.yaml";
    private static final int CHUNK_SIZE = 8192; // 8KB chunks

    @Inject
    Vertx vertx;

    @Inject
    LogTailService tailService;

    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public void streamLog(@QueryParam("path") @DefaultValue(LOG_FILE_PATH) String filePath,
                          @Context SseEventSink eventSink,
                          @Context Sse sse) {
        tailService.tailLogFile(filePath, sse, eventSink);
    }


//    @GET
//    @Path("/test-vertx")
//    public String testVertx() {
//        System.out.println("Vert.x instance: " + vertx);
//        return "Check console logs";
//    }
//
//
//    @GET
//    @Path("/test-fs")
//    public String testFS() {
//        String normalized = "/Users/nalinkumar/Developer";
//
//        try {
//            String[] files = new File(normalized).list();
//            return "Files: " + Arrays.toString(files);
//        } catch (Exception e) {
//            return "ERROR: " + e.getMessage();
//        }
//    }
//
//    @GET
//    @Path("/test-node")
//    public TreeNodeData testNode() {
//        TreeNodeData node = new TreeNodeData();
//        node.label = "test";
//        node.value = "/test/path";
//        node.nodeProps = Map.of("isDir", true, "size", 1024);
//        return node;
//    }
//
//    @GET
//    @Path("/test-uni")
//    public Uni<String> testUni() {
//        System.out.println("TEST UNI CALLED");
//        return Uni.createFrom().item("Hello")
//                .onItem().invoke(x -> System.out.println("UNI EXECUTED"));
//    }


}