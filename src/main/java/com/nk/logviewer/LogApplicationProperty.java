package com.nk.logviewer;


import io.smallrye.config.ConfigMapping;

@ConfigMapping(prefix = "application.properties")
public interface LogApplicationProperty {

    String rootPathDirectory();
}
