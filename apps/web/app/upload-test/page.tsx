"use client";

import { useState } from "react";

export default function ImageUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/generate-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `${Date.now()}_${file.name}`,
            contentType: file.type,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to get signed URL");
      const { uploadUrl, publicUrl } = await res.json();

      console.log(uploadUrl);

      const upload = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!upload.ok) throw new Error("Upload to GCP failed");

      setImageUrl(publicUrl);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Image Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="mb-4"
      />

      {loading && <p className="text-blue-500">Uploading...</p>}

      {imageUrl && (
        <div className="mt-4">
          <h2 className="font-semibold">Uploaded Image:</h2>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full mt-2 rounded shadow"
          />
        </div>
      )}
    </main>
  );
}
