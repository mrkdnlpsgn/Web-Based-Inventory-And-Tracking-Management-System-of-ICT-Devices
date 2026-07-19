package com.sanjose.inventory.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"
    );
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10 MB

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    /** Validates and stores an image under {@code subdir}, returning the path relative to the upload root. */
    public String storeImage(MultipartFile file, String subdir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file was provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds the 10 MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPEG, PNG, WEBP, or HEIC images are allowed.");
        }

        String extension = extensionFor(contentType);
        String filename = UUID.randomUUID() + extension;
        String relativePath = subdir + "/" + filename;

        try {
            Path target = resolve(relativePath);
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file.", e);
        }
        return relativePath;
    }

    public void delete(String relativePath) {
        if (!StringUtils.hasText(relativePath)) return;
        try {
            Files.deleteIfExists(resolve(relativePath));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete stored file.", e);
        }
    }

    private Path resolve(String relativePath) {
        Path base = Path.of(uploadDir).toAbsolutePath().normalize();
        Path target = base.resolve(relativePath).normalize();
        if (!target.startsWith(base)) {
            throw new IllegalArgumentException("Invalid file path.");
        }
        return target;
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/heic" -> ".heic";
            case "image/heif" -> ".heif";
            default           -> ".jpg";
        };
    }
}
