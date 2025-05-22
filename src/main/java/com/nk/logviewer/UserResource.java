package com.nk.logviewer;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.NoCache;

import java.util.Set;

@Path("/api/user")
public class UserResource {

    @Inject
    SecurityIdentity identity;

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    @NoCache
    public User me() {
        return new User(identity);
    }

    public static class User {

        private final String userName;
        private final Set<String> roles;

        User(SecurityIdentity identity) {
            this.userName = identity.getPrincipal().getName();
            this.roles = identity.getRoles();
        }

        public String getUserName() {
            return userName;
        }
        
        public Set<String> getRoles() {
			      return roles;
		    }
    }
}