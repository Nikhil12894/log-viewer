package com.nk.logviewer;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.vertx.mutiny.core.file.FileProps;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RegisterForReflection
public class TreeNodeData {
    public String label;
    public String value;
    public Map<String, Object> nodeProps;
    public List<TreeNodeData> children;

    // Helper constructor
    public TreeNodeData(Path path, FileProps attrs) {
        this.label = path.getFileName().toString();
        this.value = path.toString();
        this.nodeProps = Map.of(
                "isDir", attrs.isDirectory(),
                "size", attrs.size(),
                "lastModified", attrs.lastModifiedTime());
    }

    public TreeNodeData() {}
}
