
package com.recipeplatform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // API endpoints
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Static images — must be CORS-accessible from the frontend
        registry.addMapping("/images/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5000")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @org.springframework.beans.factory.annotation.Value("${app.file-upload.dir:upload}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        // Serve user-uploaded images from the filesystem upload dir
        String absPath = "file:" + java.nio.file.Paths.get(uploadDir).toAbsolutePath().toString().replace("\\", "/") + "/";
        registry.addResourceHandler("/images/**")
                .addResourceLocations(absPath, "classpath:/static/images/");
    }
}
