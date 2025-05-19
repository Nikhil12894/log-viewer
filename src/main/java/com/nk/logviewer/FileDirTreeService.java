package com.nk.logviewer;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.vertx.mutiny.core.Vertx;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class FileDirTreeService {

    @Inject
    Vertx vertx;

    @Inject
    LogApplicationProperty logApplicationProperty;

    public Uni<List<TreeNodeData>> scanDirectoryRecursive(String path, int remainingDepth) {
        // 1. Verify path exists
        return vertx.fileSystem().exists(path)
                .onItem().transformToUni(exists -> {
                    if (!exists) {
                        return Uni.createFrom().item(Collections.<TreeNodeData>emptyList());
                    }

                    // 2. Get current directory properties
                    return vertx.fileSystem().props(path)
                            .onItem().transformToUni(props -> {
                                // 3. If it's a file, return just the node
                                if (!props.isDirectory() || remainingDepth <= 0) {
                                    TreeNodeData node = new TreeNodeData(Paths.get(path), props);
                                    node.children = null; // Files or max depth reached
                                    return Uni.createFrom().item(List.of(node));
                                }

                                // 4. If directory, scan children
                                return vertx.fileSystem().readDir(path)
                                        .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
                                        .onItem().transformToMulti(Multi.createFrom()::iterable)
                                        .onItem().transformToUniAndConcatenate(childPath ->
                                                scanDirectoryRecursive(childPath, remainingDepth - 1)
                                        )
                                        .collect().asList()
                                        .onItem().transform(childLists -> {
                                            // 5. Flatten nested lists
                                            List<TreeNodeData> children = childLists.stream()
                                                    .flatMap(List::stream)
                                                    .collect(Collectors.toList());

                                            TreeNodeData node = new TreeNodeData(Paths.get(path), props);
                                            node.children = children;
                                            return List.of(node);
                                        });
                            });
                })
                .onFailure().recoverWithUni(e -> {
                    Log.warn("Skipping " + path + ": " + e.getMessage());
                    return Uni.createFrom().item(List.of());
                });
    }

    public String getBaseDir() {
        Log.info("rootPathDirectory: " + logApplicationProperty.rootPathDirectory());
        return logApplicationProperty.rootPathDirectory();
    }


}
