"use client";

import React, { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

interface ImageUploaderProps {
  initialImages?: string[];
  maxImages?: number;
}

export default function ImageUploader({ initialImages = [], maxImages = 5 }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Você só pode enviar até ${maxImages} imagens.`);
      return;
    }

    setIsUploading(true);
    const newImages = [...images];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      setImages(newImages);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Ocorreu um erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [images, maxImages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hidden input to pass data to server action */}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      
      <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
        Imagens do Produto (Máx. {maxImages})
      </label>

      {/* Grid of uploaded images */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
          {images.map((url, idx) => (
            <div 
              key={idx} 
              style={{ 
                position: "relative", 
                aspectRatio: "1", 
                borderRadius: 8, 
                overflow: "hidden", 
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.8)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.6)")}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "var(--neon-cyan)" : "var(--border-color)"}`,
            borderRadius: 12,
            padding: "32px",
            textAlign: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            background: dragActive ? "rgba(0, 255, 255, 0.05)" : "var(--bg-secondary)",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 140
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div style={{ color: "var(--text-secondary)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="spinner" style={{ width: 16, height: 16, border: "2px solid var(--text-secondary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Enviando...
            </div>
          ) : (
            <>
              <div style={{ fontSize: 24, color: "var(--text-secondary)" }}>📁</div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
                PNG, JPG, WEBP (Máximo 5)
              </p>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
