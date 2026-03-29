import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image, Film, AlertCircle } from "lucide-react";

export default function FileUpload({ files, setFiles, maxFiles = 5 }) {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length > 0) return;
      const newFiles = [...files, ...accepted].slice(0, maxFiles);
      setFiles(newFiles);
    },
    [files, setFiles, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"], "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"] },
    maxFiles,
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? "var(--accent-cyan)" : "var(--border-hover)"}`,
          borderRadius: "var(--radius-md)",
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragActive ? "var(--accent-cyan-dim)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s ease",
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: isDragActive ? "var(--accent-cyan-dim)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Upload size={22} color={isDragActive ? "var(--accent-cyan)" : "var(--text-secondary)"} />
          </div>
          <div>
            <p style={{ color: isDragActive ? "var(--accent-cyan)" : "var(--text-primary)", fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
              {isDragActive ? "Drop files here" : "Drag & drop evidence files"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Images (JPG, PNG, GIF, WEBP) or Videos (MP4, MOV, AVI) • Max 100MB each • Up to {maxFiles} files</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" style={{ pointerEvents: "none" }}>Browse Files</button>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "var(--accent-red-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--accent-red)" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{fileRejections[0]?.errors[0]?.message || "File rejected"}</span>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((file, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: file.type.startsWith("video") ? "rgba(167,139,250,0.15)" : "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {file.type.startsWith("video") ? <Film size={16} color="var(--accent-purple)" /> : <Image size={16} color="var(--accent-cyan)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatSize(file.size)} • {file.type}</p>
              </div>
              <button type="button" onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", borderRadius: 4 }}>
                <X size={16} />
              </button>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>{files.length}/{maxFiles} files selected</p>
        </div>
      )}
    </div>
  );
}
