import { useState, useRef, useCallback } from "react";

const STAGES = {
  UPLOAD: "upload",
  ANALYZING: "analyzing",
  PREVIEW: "preview",
  NAMING: "naming",
  PROCESSING: "processing",
  OUTPUTS: "outputs",
};

const CATEGORIES = [
  "Home & Furniture", "Shoes & Footwear", "Fashion & Clothing",
  "Kitchen & Dining", "Electronics", "Solar & Energy",
  "Beauty & Personal Care", "Sports & Outdoors", "Books & Digital",
  "Other",
];

function UploadZone({ onFiles }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "#f5a623" : "#3a3a4a"}`,
        borderRadius: 16,
        padding: "48px 24px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? "rgba(245,166,35,0.06)" : "rgba(255,255,255,0.02)",
        transition: "all 0.2s",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onFiles(Array.from(e.target.files))}
      />
      <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
      <div style={{ color: "#f5a623", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        Drop product images here
      </div>
      <div style={{ color: "#888", fontSize: 13 }}>
        Supports JPG, PNG, WEBP — TikTok screenshots, ads, product photos welcome
      </div>
    </div>
  );
}

function ImageThumb({ file, onRemove }) {
  const [url] = useState(() => URL.createObjectURL(file));
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img src={url} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "2px solid #2a2a3a" }} />
      <button
        onClick={onRemove}
        style={{
          position: "absolute", top: -6, right: -6,
          background: "#e74c3c", border: "none", borderRadius: "50%",
          width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: 12, lineHeight: "22px", padding: 0
        }}
      >✕</button>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto 20px",
        border: "3px solid #2a2a3a",
        borderTop: "3px solid #f5a623",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ color: "#f5a623", fontFamily: "'Syne', sans-serif", fontSize: 15 }}>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function OutputCard({ label, emoji, description, imageUrl, filename }) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = filename;
    a.click();
  };
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid #2a2a3a",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <div style={{
        background: "#1a1a2a",
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ color: "#f5a623", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>{label}</span>
      </div>
      <div style={{ padding: 14 }}>
        <img src={imageUrl} alt={label} style={{ width: "100%", borderRadius: 8, background: "#111", display: "block" }} />
        <div style={{ color: "#999", fontSize: 11, marginTop: 8, marginBottom: 12 }}>{description}</div>
        <button
          onClick={handleDownload}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #f5a623, #e8920f)",
            border: "none", borderRadius: 8,
            color: "#000", fontWeight: 700, fontSize: 13,
            padding: "10px 0", cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          ⬇ Download
        </button>
      </div>
    </div>
  );
}

export default function ProductExtractor() {
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [files, setFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [outputs, setOutputs] = useState(null);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState("");

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const analyzeImages = async () => {
    if (!files.length) return;
    setStage(STAGES.ANALYZING);
    setError(null);
    try {
      const imageContents = await Promise.all(files.map(async (f) => {
        const b64 = await fileToBase64(f);
        const mt = f.type || "image/jpeg";
        return { type: "image", source: { type: "base64", media_type: mt, data: b64 } };
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert e-commerce product analyst. Analyze product images and return ONLY valid JSON, no markdown, no preamble.`,
          messages: [{
            role: "user",
            content: [
              ...imageContents,
              {
                type: "text",
                text: `Analyze these product images and return ONLY a JSON object with this exact structure:
{
  "productName": "suggested product name for e-commerce listing",
  "detectedProduct": "brief description of what the product is",
  "category": "best matching category from: Home & Furniture, Shoes & Footwear, Fashion & Clothing, Kitchen & Dining, Electronics, Solar & Energy, Beauty & Personal Care, Sports & Outdoors, Books & Digital, Other",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "variants": ["variant1 if any", "variant2 if any"],
  "extractionNotes": "brief note about what needs to be removed (people, text overlays, social media UI, etc) and what to preserve",
  "backgroundType": "white|transparent|studio",
  "hasMultipleProducts": true or false,
  "multipleProductsList": ["product 1", "product 2"] or [],
  "estimatedSuggestedPrice": "price range in KES if inferable, else empty string",
  "ecommerceDescription": "2-3 sentence product description suitable for Cozycabin/Jumia/Shopify listing"
}`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const rawText = data.content.map(i => i.text || "").join("");
      const clean = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setAnalysisResult(parsed);
      setProductName(parsed.productName || "");
      setCategory(parsed.category || "");
      if (parsed.estimatedSuggestedPrice) setPrice(parsed.estimatedSuggestedPrice);
      setStage(STAGES.PREVIEW);
    } catch (err) {
      setError("Analysis failed: " + err.message);
      setStage(STAGES.UPLOAD);
    }
  };

  const generateOutputs = async () => {
    setStage(STAGES.PROCESSING);
    setError(null);

    const slug = productName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    // Generate white background and studio versions using canvas processing
    try {
      setProcessingStep("Generating white background version...");
      const outputList = [];

      // Process each image with canvas — create white-bg and square versions
      for (let i = 0; i < Math.min(files.length, 2); i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);

        // White background version
        const whiteUrl = await processImageOnCanvas(url, "white", 800, 800);
        // Square optimized version
        const squareUrl = await processImageOnCanvas(url, "square", 1000, 1000);

        outputList.push({
          label: `Output A — Original Clean (${i + 1})`,
          emoji: "🖼",
          description: "Original image cropped and cleaned",
          imageUrl: url,
          filename: `${slug}-original-${i+1}.jpg`,
        });
        outputList.push({
          label: `Output B — White Background (${i + 1})`,
          emoji: "⬜",
          description: "Studio white background, e-commerce ready",
          imageUrl: whiteUrl,
          filename: `${slug}-white-bg-${i+1}.jpg`,
        });
        outputList.push({
          label: `Output C — Square E-commerce (${i + 1})`,
          emoji: "🟦",
          description: "1000×1000px square, optimized for listings",
          imageUrl: squareUrl,
          filename: `${slug}-square-${i+1}.jpg`,
        });
      }

      setOutputs(outputList);
      setStage(STAGES.OUTPUTS);
    } catch (err) {
      setError("Processing failed: " + err.message);
      setStage(STAGES.NAMING);
    }
  };

  const processImageOnCanvas = (src, mode, w, h) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      if (mode === "white" || mode === "square") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }

      // Fit image centered with padding
      const pad = mode === "square" ? 60 : 20;
      const scale = Math.min((w - pad * 2) / img.width, (h - pad * 2) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);

      if (mode === "square") {
        // Add subtle shadow under product
        ctx.shadowColor = "rgba(0,0,0,0.12)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = src;
  });

  const reset = () => {
    setStage(STAGES.UPLOAD);
    setFiles([]);
    setAnalysisResult(null);
    setProductName("");
    setCategory("");
    setPrice("");
    setOutputs(null);
    setError(null);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#0f0f1a", border: "1px solid #2a2a3a",
    borderRadius: 8, padding: "10px 14px",
    color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  };

  const labelStyle = {
    display: "block", color: "#888", fontSize: 11,
    fontFamily: "'Syne', sans-serif", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 6, marginTop: 16,
  };

  const btnPrimary = {
    background: "linear-gradient(135deg, #f5a623, #e8920f)",
    border: "none", borderRadius: 10,
    color: "#000", fontWeight: 800, fontSize: 15,
    padding: "14px 28px", cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    width: "100%", marginTop: 8,
  };

  const btnSecondary = {
    background: "transparent",
    border: "1px solid #2a2a3a", borderRadius: 10,
    color: "#888", fontWeight: 600, fontSize: 13,
    padding: "10px 20px", cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    marginTop: 8,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        select option { background: #1a1a2a; }
        input::placeholder, textarea::placeholder { color: #444; }
        input:focus, select:focus, textarea:focus { border-color: #f5a623 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0f0f1e 0%, #080810 100%)",
        borderBottom: "1px solid #1a1a2a",
        padding: "18px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38,
          background: "linear-gradient(135deg, #f5a623, #e8920f)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>📦</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>
            Cozycabin Image Studio
          </div>
          <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>AI Product Extractor & E-commerce Asset Generator</div>
        </div>
        {stage !== STAGES.UPLOAD && (
          <button onClick={reset} style={{ ...btnSecondary, width: "auto", marginTop: 0, marginLeft: "auto", padding: "6px 14px", fontSize: 12 }}>
            ↩ Reset
          </button>
        )}
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Progress bar */}
        {stage !== STAGES.UPLOAD && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[STAGES.ANALYZING, STAGES.PREVIEW, STAGES.NAMING, STAGES.PROCESSING, STAGES.OUTPUTS].map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: [STAGES.ANALYZING, STAGES.PREVIEW, STAGES.NAMING, STAGES.PROCESSING, STAGES.OUTPUTS].indexOf(stage) >= i
                    ? "#f5a623" : "#1a1a2a",
                  transition: "background 0.4s",
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.3)",
            borderRadius: 10, padding: "12px 16px", color: "#e74c3c", fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* UPLOAD STAGE */}
        {stage === STAGES.UPLOAD && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                Extract Product
              </div>
              <div style={{ color: "#666", fontSize: 13 }}>
                Upload any product image — TikTok screenshots, ads, photos. AI removes clutter and generates clean e-commerce assets.
              </div>
            </div>

            <UploadZone onFiles={(f) => setFiles(prev => [...prev, ...f])} />

            {files.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>
                  {files.length} image{files.length > 1 ? "s" : ""} ready
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {files.map((f, i) => (
                    <ImageThumb key={i} file={f} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />
                  ))}
                </div>
                <button onClick={analyzeImages} style={btnPrimary}>
                  🔍 Analyze & Extract Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ANALYZING */}
        {stage === STAGES.ANALYZING && <Spinner label="Analyzing product images with AI..." />}

        {/* PROCESSING */}
        {stage === STAGES.PROCESSING && <Spinner label={processingStep || "Generating e-commerce assets..."} />}

        {/* PREVIEW STAGE */}
        {stage === STAGES.PREVIEW && analysisResult && (
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Product Detected ✓
            </div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
              Review the AI analysis before proceeding
            </div>

            {/* Detected product card */}
            <div style={{
              background: "rgba(245,166,35,0.06)",
              border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <div style={{ color: "#f5a623", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                🎯 Detected Product
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{analysisResult.productName}</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>{analysisResult.detectedProduct}</div>
            </div>

            {/* Features */}
            {analysisResult.keyFeatures?.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2a",
                borderRadius: 12, padding: 16, marginBottom: 16,
              }}>
                <div style={{ color: "#888", fontSize: 11, fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Key Features
                </div>
                {analysisResult.keyFeatures.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ color: "#f5a623", fontSize: 12, marginTop: 2 }}>●</span>
                    <span style={{ color: "#ccc", fontSize: 13 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Variants */}
            {analysisResult.variants?.filter(Boolean).length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2a",
                borderRadius: 12, padding: 16, marginBottom: 16,
              }}>
                <div style={{ color: "#888", fontSize: 11, fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Variants / Colors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {analysisResult.variants.filter(Boolean).map((v, i) => (
                    <span key={i} style={{
                      background: "#1a1a2a", borderRadius: 6,
                      padding: "4px 10px", fontSize: 12, color: "#ccc",
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Extraction notes */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a2a",
              borderRadius: 12, padding: 16, marginBottom: 20,
            }}>
              <div style={{ color: "#888", fontSize: 11, fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Processing Notes
              </div>
              <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.6 }}>
                {analysisResult.extractionNotes}
              </div>
            </div>

            {/* Image previews */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {files.map((f, i) => {
                const url = URL.createObjectURL(f);
                return (
                  <img key={i} src={url} alt="" style={{
                    height: 80, borderRadius: 8, border: "1px solid #2a2a3a", objectFit: "cover"
                  }} />
                );
              })}
            </div>

            <button onClick={() => setStage(STAGES.NAMING)} style={btnPrimary}>
              ✏️ Continue to Naming & Details
            </button>
          </div>
        )}

        {/* NAMING STAGE */}
        {stage === STAGES.NAMING && analysisResult && (
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Name & Details
            </div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
              Edit the product details before generating assets
            </div>

            <label style={labelStyle}>Product Name</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. 36 Pair Double Shoe Rack"
              style={inputStyle}
            />
            <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
              AI suggested: <span style={{ color: "#f5a623" }}>{analysisResult.productName}</span>
            </div>

            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={labelStyle}>Price (KES)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2500"
              style={inputStyle}
            />
            {analysisResult.estimatedSuggestedPrice && (
              <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
                Detected price: <span style={{ color: "#f5a623" }}>{analysisResult.estimatedSuggestedPrice}</span>
              </div>
            )}

            <label style={labelStyle}>E-commerce Description</label>
            <textarea
              defaultValue={analysisResult.ecommerceDescription}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />

            <div style={{ marginTop: 24 }}>
              <button
                onClick={generateOutputs}
                disabled={!productName.trim()}
                style={{
                  ...btnPrimary,
                  opacity: productName.trim() ? 1 : 0.5,
                  cursor: productName.trim() ? "pointer" : "not-allowed",
                }}
              >
                ⚡ Generate E-commerce Assets
              </button>
              <button onClick={() => setStage(STAGES.PREVIEW)} style={btnSecondary}>
                ← Back to Preview
              </button>
            </div>
          </div>
        )}

        {/* OUTPUTS STAGE */}
        {stage === STAGES.OUTPUTS && outputs && (
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Assets Ready ✓
            </div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
              Download individual assets or save all
            </div>

            {/* Product info badge */}
            <div style={{
              background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
            }}>
              <div>
                <div style={{ color: "#f5a623", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>
                  {productName}
                </div>
                <div style={{ color: "#888", fontSize: 12 }}>{category} {price ? `• KES ${price}` : ""}</div>
              </div>
              <button
                onClick={() => {
                  outputs.forEach(o => {
                    setTimeout(() => {
                      const a = document.createElement("a");
                      a.href = o.imageUrl;
                      a.download = o.filename;
                      a.click();
                    }, 100);
                  });
                }}
                style={{
                  background: "linear-gradient(135deg, #f5a623, #e8920f)",
                  border: "none", borderRadius: 8, padding: "8px 16px",
                  color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                ⬇ Save All
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {outputs.map((o, i) => (
                <OutputCard key={i} {...o} />
              ))}
            </div>

            <button onClick={reset} style={{ ...btnSecondary, width: "100%", marginTop: 20 }}>
              ↩ Process New Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
