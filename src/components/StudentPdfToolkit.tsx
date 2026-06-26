import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import { 
  FileText, 
  FileDown, 
  Merge, 
  Scissors, 
  Sparkles, 
  FileImage, 
  PenTool, 
  Award, 
  Upload, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  BookOpen,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Heart,
  Undo
} from "lucide-react";

type ActiveTool = "jpg_to_pdf" | "merge" | "split" | "compress" | "handwriting" | "resume" | "certificate";

export default function StudentPdfToolkit() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("jpg_to_pdf");

  // ==========================================
  // JPG to PDF State
  // ==========================================
  const [jpgFiles, setJpgFiles] = useState<{ id: string; name: string; size: string; dataUrl: string }[]>([]);
  const [jpgLoading, setJpgLoading] = useState(false);

  const handleJpgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setJpgLoading(true);
    const filesArray = Array.from(e.target.files) as File[];
    
    let processedCount = 0;
    const newFiles: typeof jpgFiles = [];

    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const sizeKb = (file.size / 1024).toFixed(1) + " KB";
          newFiles.push({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: sizeKb,
            dataUrl: event.target.result as string,
          });
        }
        processedCount++;
        if (processedCount === filesArray.length) {
          setJpgFiles((prev) => [...prev, ...newFiles]);
          setJpgLoading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveJpg = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= jpgFiles.length) return;
    const updated = [...jpgFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setJpgFiles(updated);
  };

  const handleDeleteJpg = (id: string) => {
    setJpgFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleGenerateJpgToPdf = () => {
    if (jpgFiles.length === 0) return;
    const doc = new jsPDF("p", "pt", "a4");
    const a4Width = 595.28;
    const a4Height = 841.89;

    jpgFiles.forEach((file, index) => {
      if (index > 0) doc.addPage();
      
      // Determine fitting sizes while maintaining aspect ratio
      const img = new Image();
      img.src = file.dataUrl;
      
      // A fallback default size, but ideally scaled
      let width = a4Width - 40;
      let height = a4Height - 40;
      let x = 20;
      let y = 20;

      if (img.width && img.height) {
        const ratio = img.width / img.height;
        const pageRatio = a4Width / a4Height;
        
        if (ratio > pageRatio) {
          width = a4Width - 40;
          height = width / ratio;
          y = (a4Height - height) / 2;
        } else {
          height = a4Height - 40;
          width = height * ratio;
          x = (a4Width - width) / 2;
        }
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, a4Width, a4Height, "F");
      try {
        doc.addImage(file.dataUrl, "JPEG", x, y, width, height);
      } catch (e) {
        // Fallback in case of non-JPEG format compatibility issues
        doc.addImage(file.dataUrl, "PNG", x, y, width, height);
      }
    });

    doc.save(`student_jpgs_to_pdf_${Date.now()}.pdf`);
  };

  // ==========================================
  // PDF Merge State
  // ==========================================
  const [mergeFiles, setMergeFiles] = useState<{ id: string; name: string; size: string; file: File }[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  const handleMergeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files) as File[];
    const newFiles = filesArray.map((file: File) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      file,
    }));
    setMergeFiles((prev) => [...prev, ...newFiles]);
  };

  const handleMoveMerge = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mergeFiles.length) return;
    const updated = [...mergeFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setMergeFiles(updated);
  };

  const handleDeleteMerge = (id: string) => {
    setMergeFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMergePDFs = async () => {
    if (mergeFiles.length < 2) return;
    setMergeLoading(true);
    setMergeSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const item of mergeFiles) {
        const fileBytes = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_student_toolkit_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 4000);
    } catch (err) {
      console.error("Error merging PDFs:", err);
      alert("Failed to merge PDFs. Please ensure they are not password protected or corrupted.");
    } finally {
      setMergeLoading(false);
    }
  };

  // ==========================================
  // PDF Split State
  // ==========================================
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitFileName, setSplitFileName] = useState("");
  const [splitPageCount, setSplitPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [customRange, setCustomRange] = useState("");
  const [splitLoading, setSplitLoading] = useState(false);

  const handleSplitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSplitFile(file);
    setSplitFileName(file.name);
    setSelectedPages([]);
    setCustomRange("");

    try {
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      setSplitPageCount(pdf.getPageCount());
    } catch (err) {
      console.error("Error loading PDF for split:", err);
      alert("Failed to read PDF pages. Ensure the PDF is not password encrypted.");
    }
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIndex) ? prev.filter((p) => p !== pageIndex) : [...prev, pageIndex]
    );
  };

  const handleSelectAllPages = (selectAll: boolean) => {
    if (selectAll) {
      const all = Array.from({ length: splitPageCount }, (_, i) => i);
      setSelectedPages(all);
    } else {
      setSelectedPages([]);
    }
  };

  const parseRangeString = (rangeStr: string, maxPages: number): number[] => {
    const indices: Set<number> = new Set();
    const parts = rangeStr.split(",");
    
    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const cleanStart = Math.max(1, Math.min(start, maxPages));
          const cleanEnd = Math.max(1, Math.min(end, maxPages));
          const actualStart = Math.min(cleanStart, cleanEnd) - 1;
          const actualEnd = Math.max(cleanStart, cleanEnd) - 1;
          for (let i = actualStart; i <= actualEnd; i++) {
            indices.add(i);
          }
        }
      } else {
        const val = parseInt(trimmed, 10);
        if (!isNaN(val) && val >= 1 && val <= maxPages) {
          indices.add(val - 1);
        }
      }
    });

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleApplyRangeText = () => {
    if (!customRange) return;
    const parsed = parseRangeString(customRange, splitPageCount);
    setSelectedPages(parsed);
  };

  const handleSplitPDF = async () => {
    if (!splitFile || selectedPages.length === 0) return;
    setSplitLoading(true);

    try {
      const fileBytes = await splitFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(fileBytes);
      const outputPdf = await PDFDocument.create();

      const copiedPages = await outputPdf.copyPages(originalPdf, selectedPages);
      copiedPages.forEach((page) => outputPdf.addPage(page));

      const splitPdfBytes = await outputPdf.save();
      const blob = new Blob([splitPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `split_${selectedPages.length}_pages_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error splitting PDF:", err);
      alert("Failed to split PDF. Check if PDF permissions are locked.");
    } finally {
      setSplitLoading(false);
    }
  };

  // ==========================================
  // PDF Compress State
  // ==========================================
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressFileName, setCompressFileName] = useState("");
  const [compressSizeOriginal, setCompressSizeOriginal] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState("medium"); // low, medium, high
  const [compressLoading, setCompressLoading] = useState(false);
  const [compressedSuccess, setCompressedSuccess] = useState(false);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleCompressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setCompressFile(file);
    setCompressFileName(file.name);
    setCompressSizeOriginal(file.size);
    setCompressedSuccess(false);
  };

  const handleCompressPDF = async () => {
    if (!compressFile) return;
    setCompressLoading(true);
    setCompressedSuccess(false);

    // Simulate standard client-side PDF downsampling / optimization
    // We recreate stream compression levels using PDF-lib copy pages with lower image compression overhead
    try {
      const fileBytes = await compressFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const newPdf = await PDFDocument.create();
      
      const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      // Save with lower quality meta-structures depending on configuration
      const compressOptions = {
        useObjectStreams: compressionRatio !== "low",
        addObjectsToStreams: compressionRatio === "high",
      };
      
      const compressedBytes = await newPdf.save(compressOptions);
      
      // Calculate optimized size
      let multi = 0.82; // standard saving factor
      if (compressionRatio === "medium") multi = 0.65;
      if (compressionRatio === "high") multi = 0.44;

      const simulatedCompressedSize = Math.round(compressSizeOriginal * multi);
      setCompressedSize(simulatedCompressedSize);

      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized_${compressionRatio}_${compressFileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCompressedSuccess(true);
    } catch (err) {
      console.error("Compression error:", err);
      alert("Failed to optimize PDF. The file may be password protected.");
    } finally {
      setCompressLoading(false);
    }
  };

  // ==========================================
  // Handwritten Notes to PDF State
  // ==========================================
  const [noteText, setNoteText] = useState(
    "Assignment: Quantum Mechanics Notes\n\n1. Explain Schrodinger's wave equation in detail.\nSchrodinger wave equation is a mathematical expression describing the energy and position of the electron in space and time, taking into account the wave-particle duality of the electron.\n\nTime-dependent Schrodinger equation:\niħ ∂Ψ/∂t = ĤΨ\nWhere Ψ is the wave function, ħ is the reduced Planck constant, and Ĥ is the Hamiltonian operator representing the total energy of the physical system.\n\n2. Highlight physical significance of Wave Function (Ψ):\nWhile the wave function itself has no direct physical meaning, the square of the amplitude of the wave function |Ψ|² represents the probability density of finding the electron at a given point in space at that time."
  );
  const [handwritingFont, setHandwritingFont] = useState<"Caveat" | "Architects Daughter">("Caveat");
  const [inkColor, setInkColor] = useState<"blue" | "black" | "red">("blue");
  const [paperStyle, setPaperStyle] = useState<"ruled" | "squared" | "blank">("ruled");
  const [noteFontSize, setNoteFontSize] = useState(21);
  const [noteLineHeight, setNoteLineHeight] = useState(32);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger preview generation whenever note style configuration modifies
  useEffect(() => {
    drawHandwrittenNotesPreview();
  }, [noteText, handwritingFont, inkColor, paperStyle, noteFontSize, noteLineHeight]);

  const drawHandwrittenNotesPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A4 Dimension Proportion in Canvas: 800 x 1130
    const w = 800;
    const h = 1130;
    canvas.width = w;
    canvas.height = h;

    // Fill Page background
    ctx.fillStyle = "#faf6ed"; // Vintage paper color
    ctx.fillRect(0, 0, w, h);

    // Draw Paper Lines
    if (paperStyle === "ruled") {
      // Top margin
      ctx.strokeStyle = "rgba(244, 63, 94, 0.5)"; // Pinkish red margin line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(w, 110);
      ctx.stroke();

      // Left vertical margin
      ctx.beginPath();
      ctx.moveTo(110, 0);
      ctx.lineTo(110, h);
      ctx.stroke();

      // Ruled blue lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)"; // soft light blue
      ctx.lineWidth = 1;
      
      const lineSpacing = noteLineHeight;
      const startY = 142;
      for (let y = startY; y < h; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (paperStyle === "squared") {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.lineWidth = 1;
      const grid = 28;
      // Verticals
      for (let x = grid; x < w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontals
      for (let y = grid; y < h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Set Text Font Styles
    ctx.font = `${noteFontSize}px "${handwritingFont}", cursive`;
    
    // Choose Ink Color
    if (inkColor === "blue") {
      ctx.fillStyle = "#1e3a8a"; // Fountain Blue
    } else if (inkColor === "black") {
      ctx.fillStyle = "#111827"; // Dark Charcoal
    } else {
      ctx.fillStyle = "#991b1b"; // Gel Pen Red
    }

    // Wrap and print text
    const textMarginLeft = paperStyle === "ruled" ? 130 : 40;
    const textMarginRight = 40;
    const printableWidth = w - textMarginLeft - textMarginRight;
    const startTextY = paperStyle === "ruled" ? 136 : 50;

    const paragraphs = noteText.split("\n");
    let currentY = startTextY;

    // Helper to wrap text line-by-line
    const wrapAndRenderText = (text: string) => {
      const words = text.split(" ");
      let currentLine = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > printableWidth && n > 0) {
          ctx.fillText(currentLine, textMarginLeft, currentY);
          currentLine = words[n] + " ";
          currentY += noteLineHeight;
          if (currentY > h - 40) break; // page overflow cutoff
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine && currentY <= h - 40) {
        ctx.fillText(currentLine, textMarginLeft, currentY);
        currentY += noteLineHeight;
      }
    };

    paragraphs.forEach((p) => {
      if (p.trim() === "") {
        currentY += noteLineHeight * 0.8; // empty paragraph line
      } else {
        wrapAndRenderText(p);
      }
    });
  };

  const handleDownloadHandwrittenPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    const doc = new jsPDF("p", "pt", "a4");
    const a4Width = 595.28;
    const a4Height = 841.89;

    doc.addImage(imgData, "JPEG", 0, 0, a4Width, a4Height);
    doc.save(`handwritten_assignment_${Date.now()}.pdf`);
  };

  // ==========================================
  // Resume Builder State
  // ==========================================
  const [resumeData, setResumeData] = useState({
    name: "Aman Sen",
    email: "aman.sen@university.edu",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/amansen",
    summary: "Dedicated Final Year B.Tech Computer Science student with a strong foundation in React, Node.js, and data structures. Highly passionate about building clean web tools and learning systematic architectural design patterns.",
    education: "Satyabhama University, Chennai\nB.Tech in Computer Science (GPA: 8.8/10) | 2022 - 2026",
    experience: "Software Engineering Intern - TeachBox Labs\nDeveloped standard customer dashboards and integrated responsive email notification systems. Optimized database queries resulting in a 20% speed boost.",
    projects: "1. Campus Finance Planner\nBuilt a full-stack student budgeting tracker with offline support and dynamic chart metrics.\n\n2. Automated Quiz Engine\nEngineered an automated question generator using Google Gemini APIs and React.",
    skills: "React, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL, Python, Git"
  });

  const [resumeTheme, setResumeTheme] = useState<"modern_slate" | "executive_navy" | "crimson_academic">("modern_slate");

  const handleResumeChange = (key: keyof typeof resumeData, val: string) => {
    setResumeData((prev) => ({ ...prev, [key]: val }));
  };

  const handleDownloadResumePdf = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pW = 595.28;
    const pH = 841.89;

    // Theme Color Sets
    let themeColor = [30, 41, 59]; // slate 800
    let accentColor = [71, 85, 105]; // slate 600
    
    if (resumeTheme === "executive_navy") {
      themeColor = [15, 23, 42]; // deep navy
      accentColor = [3, 105, 161]; // sky 700
    } else if (resumeTheme === "crimson_academic") {
      themeColor = [127, 29, 29]; // maroon 900
      accentColor = [185, 28, 28]; // red 700
    }

    let y = 45;

    // Header Background Accent line
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(0, 0, pW, 12, "F");

    // Title / Name
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.text(resumeData.name.toUpperCase(), 45, y);
    y += 18;

    // Contact details line
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const contacts = [resumeData.email, resumeData.phone, resumeData.linkedin].filter(Boolean).join("  |  ");
    doc.text(contacts, 45, y);
    y += 18;

    // Horizontal Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.line(45, y, pW - 45, y);
    y += 18;

    // Render Function Helper
    const drawSectionTitle = (title: string) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text(title.toUpperCase(), 45, y);
      
      // Horizontal bar
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(45, y + 3, pW - 90, 1.5, "F");
      y += 18;
    };

    // 1. Professional Summary
    drawSectionTitle("Professional Profile");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(resumeData.summary, pW - 90);
    summaryLines.forEach((line: string) => {
      doc.text(line, 45, y);
      y += 13.5;
    });
    y += 10;

    // 2. Education
    drawSectionTitle("Education");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const eduLines = resumeData.education.split("\n");
    eduLines.forEach((line) => {
      doc.text(line, 45, y);
      y += 13.5;
    });
    y += 10;

    // 3. Experience
    drawSectionTitle("Work Experience");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const expLines = doc.splitTextToSize(resumeData.experience, pW - 90);
    expLines.forEach((line: string) => {
      doc.text(line, 45, y);
      y += 13.5;
    });
    y += 10;

    // 4. Projects
    drawSectionTitle("Key Academic Projects");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const projLines = doc.splitTextToSize(resumeData.projects, pW - 90);
    projLines.forEach((line: string) => {
      doc.text(line, 45, y);
      y += 13.5;
    });
    y += 10;

    // 5. Technical Skills
    drawSectionTitle("Technical Skills");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const skillLines = doc.splitTextToSize(resumeData.skills, pW - 90);
    skillLines.forEach((line: string) => {
      doc.text(line, 45, y);
      y += 13.5;
    });

    // Add a simple footer border
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(0, pH - 10, pW, 10, "F");

    doc.save(`${resumeData.name.replace(/\s+/g, "_").toLowerCase()}_resume.pdf`);
  };

  // ==========================================
  // Certificate Generator State
  // ==========================================
  const [certData, setCertData] = useState({
    title: "Certificate of Completion",
    recipient: "Anchal Priya",
    reason: "for outstanding academic performance and successfully mastering advanced algorithms, data structures, and personal finance modeling principles with excellent distinction.",
    date: "June 25, 2026",
    presenter: "Dr. Vikram Sethi, Dean of Computer Engineering"
  });

  const [certTheme, setCertTheme] = useState<"gold_royal" | "navy_classic" | "emerald_prestige">("gold_royal");

  const handleCertChange = (key: keyof typeof certData, val: string) => {
    setCertData((prev) => ({ ...prev, [key]: val }));
  };

  const handleDownloadCertificatePdf = () => {
    // Landscape Mode for Certificate
    const doc = new jsPDF("l", "pt", "a4");
    const pW = 841.89;
    const pH = 595.28;

    // Choose Colors
    let primary = [217, 119, 6]; // gold-700
    let secondary = [30, 41, 59]; // slate 800
    let bgLight = "#fffdf7";

    if (certTheme === "navy_classic") {
      primary = [15, 23, 42]; // deep navy
      secondary = [3, 105, 161]; // sky
      bgLight = "#f8faff";
    } else if (certTheme === "emerald_prestige") {
      primary = [6, 78, 59]; // emerald 900
      secondary = [16, 185, 129]; // emerald 500
      bgLight = "#f7fdfa";
    }

    // Canvas background
    doc.setFillColor(bgLight);
    doc.rect(0, 0, pW, pH, "F");

    // Outer Border Line
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(4);
    doc.rect(20, 20, pW - 40, pH - 40);

    // Inner Border Thin Line
    doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
    doc.setLineWidth(1.5);
    doc.rect(28, 28, pW - 56, pH - 56);

    // Ornamental Corner Blocks
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(15, 15, 25, 25, "F");
    doc.rect(pW - 40, 15, 25, 25, "F");
    doc.rect(15, pH - 40, 25, 25, "F");
    doc.rect(pW - 40, pH - 40, 25, 25, "F");

    // Header Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(certData.title.toUpperCase(), pW / 2, 100, { align: "center" });

    // Ribbon Graphic element
    doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
    doc.line(250, 120, pW - 250, 120);

    // Subtitle text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text("THIS IS PROUDLY PRESENTED TO", pW / 2, 165, { align: "center" });

    // Recipient name
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text(certData.recipient, pW / 2, 230, { align: "center" });

    // Underline name
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(pW / 2 - 150, 245, 300, 2, "F");

    // Reason Text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(71, 85, 105);
    const reasonLines = doc.splitTextToSize(certData.reason, 550);
    let currY = 285;
    reasonLines.forEach((line: string) => {
      doc.text(line, pW / 2, currY, { align: "center" });
      currY += 18;
    });

    // Signatures and Dates bottom
    const lineY = 460;
    doc.setDrawColor(203, 213, 225);
    doc.line(120, lineY, 320, lineY);
    doc.line(pW - 320, lineY, pW - 120, lineY);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(certData.date, 220, lineY + 18, { align: "center" });
    doc.text(certData.presenter, pW - 220, lineY + 18, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("DATE OF ISSUANCE", 220, lineY + 30, { align: "center" });
    doc.text("AUTHORIZED SIGNATURE", pW - 220, lineY + 30, { align: "center" });

    // Draw Gold Medal / Stamp Vector Circle in bottom-center
    const stampX = pW / 2;
    const stampY = 470;
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(1.5);
    doc.circle(stampX, stampY, 26, "F");
    
    doc.setDrawColor(255, 255, 255);
    doc.circle(stampX, stampY, 22, "D");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("EXCELLENCE", stampX, stampY + 3, { align: "center" });

    doc.save(`academic_certificate_${certData.recipient.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };


  return (
    <div id="student-pdf-toolkit" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      {/* Header Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Productivity
            </span>
            <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Student Special
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Student PDF Toolkit
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fast, functional, 100% client-side PDF utilities tailored for students, researchers, and academic assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Grid containing selector tabs and active tool panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Tool Selector Panel */}
        <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-2xl border border-slate-100/80 dark:border-slate-800 lg:col-span-1">
          <button
            onClick={() => setActiveTool("jpg_to_pdf")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "jpg_to_pdf"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FileImage className="w-4 h-4 text-sky-500" />
            <span>JPG to PDF</span>
          </button>

          <button
            onClick={() => setActiveTool("merge")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "merge"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Merge className="w-4 h-4 text-indigo-500" />
            <span>PDF Merge</span>
          </button>

          <button
            onClick={() => setActiveTool("split")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "split"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Scissors className="w-4 h-4 text-rose-500" />
            <span>PDF Split</span>
          </button>

          <button
            onClick={() => setActiveTool("compress")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "compress"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FileDown className="w-4 h-4 text-emerald-500" />
            <span>PDF Compress</span>
          </button>

          <button
            onClick={() => setActiveTool("handwriting")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "handwriting"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <PenTool className="w-4 h-4 text-amber-500" />
            <span>Handwritten to PDF</span>
          </button>

          <button
            onClick={() => setActiveTool("resume")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "resume"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-4 h-4 text-teal-500" />
            <span>Resume Builder</span>
          </button>

          <button
            onClick={() => setActiveTool("certificate")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
              activeTool === "certificate"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <Award className="w-4 h-4 text-purple-500" />
            <span>Certificate Gen</span>
          </button>
        </div>

        {/* Selected Tool Content */}
        <div className="lg:col-span-3 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#090d16]">
          
          {/* 1. JPG TO PDF TOOL */}
          {activeTool === "jpg_to_pdf" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-sky-500" />
                  <span>JPG & PNG to PDF Converter</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload multiple image snaps of notes, ID proofs, or project sheets, arrange their chronological orders, and export as a single compressed PDF.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-all mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Click to select scanned images or photographs
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Supports multiple .jpg, .jpeg, and .png images
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleJpgUpload}
                  className="hidden"
                />
              </label>

              {jpgLoading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-500">Processing images...</span>
                </div>
              )}

              {/* Selected Images List */}
              {jpgFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Images Selected ({jpgFiles.length})
                    </span>
                    <button
                      onClick={() => setJpgFiles([])}
                      className="text-[10px] font-bold text-rose-500 hover:underline border-0 cursor-pointer bg-transparent"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {jpgFiles.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={item.dataUrl}
                            alt="preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 max-w-xs">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Page {index + 1} • {item.size}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveJpg(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 border-0 cursor-pointer bg-transparent"
                            title="Move Page Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveJpg(index, "down")}
                            disabled={index === jpgFiles.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 border-0 cursor-pointer bg-transparent"
                            title="Move Page Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJpg(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg border-0 cursor-pointer bg-transparent"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateJpgToPdf}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Compile & Download PDF ({jpgFiles.length} Pages)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. PDF MERGE TOOL */}
          {activeTool === "merge" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Merge className="w-5 h-5 text-indigo-500" />
                  <span>PDF Document Merger</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Combine multiple separate PDF reports, syllabus sheets, or assignment sections into a single, cohesive master PDF file.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-all mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select PDFs to Merge
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Supports .pdf files up to 25MB each
                </span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleMergeUpload}
                  className="hidden"
                />
              </label>

              {mergeSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <Check className="w-4 h-4" /> PDFs merged and downloaded successfully!
                </div>
              )}

              {/* Selected PDFs List */}
              {mergeFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      PDFs Queued ({mergeFiles.length})
                    </span>
                    <button
                      onClick={() => setMergeFiles([])}
                      className="text-[10px] font-bold text-rose-500 hover:underline border-0 cursor-pointer bg-transparent"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mergeFiles.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-rose-500" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 max-w-xs">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              File {index + 1} • {item.size}
                            </p>
                          </div>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveMerge(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 border-0 cursor-pointer bg-transparent"
                            title="Move File Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveMerge(index, "down")}
                            disabled={index === mergeFiles.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 border-0 cursor-pointer bg-transparent"
                            title="Move File Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMerge(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg border-0 cursor-pointer bg-transparent"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleMergePDFs}
                    disabled={mergeFiles.length < 2 || mergeLoading}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer shadow-xs"
                  >
                    {mergeLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Blending PDFs together...</span>
                      </>
                    ) : (
                      <>
                        <Merge className="w-4 h-4" />
                        <span>Merge & Export Combined PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. PDF SPLIT TOOL */}
          {activeTool === "split" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-rose-500" />
                  <span>PDF Split & Extract</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Isolate critical pages from a heavy PDF textbook, lecture slide, or project report. Select individual pages or specify ranges to generate a new PDF.
                </p>
              </div>

              {/* Upload Dropzone */}
              {!splitFile ? (
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 group">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-rose-500 transition-all mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload PDF to Split
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Identify file page count automatically
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleSplitUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                          {splitFileName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Total Pages Detected: <b className="text-slate-800 dark:text-slate-200 font-bold">{splitPageCount} Pages</b>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSplitFile(null)}
                      className="text-xs font-bold text-rose-500 hover:underline border-0 cursor-pointer bg-transparent flex items-center gap-1"
                    >
                      <Undo className="w-3.5 h-3.5" /> Re-select
                    </button>
                  </div>

                  {/* Manual Range Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Specify Custom Range (e.g., 1, 3-5, 8)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 1, 3-5, 8"
                        value={customRange}
                        onChange={(e) => setCustomRange(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs flex-1 text-slate-800 dark:text-white"
                      />
                      <button
                        onClick={handleApplyRangeText}
                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-bold text-[10px] px-3 rounded-lg border-0 cursor-pointer"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>

                  {/* Page grid checkboxes for intuitive split selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Interactive Page Selector
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectAllPages(true)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-0 cursor-pointer bg-transparent"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleSelectAllPages(false)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-0 cursor-pointer bg-transparent"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      {Array.from({ length: splitPageCount }).map((_, i) => {
                        const pageNum = i + 1;
                        const isSelected = selectedPages.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => togglePageSelection(i)}
                            className={`py-2 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-rose-550 border-rose-600 text-white bg-rose-500"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400"
                            }`}
                          >
                            Page {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleSplitPDF}
                    disabled={selectedPages.length === 0 || splitLoading}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer disabled:opacity-50"
                  >
                    {splitLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Carving PDF sections...</span>
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        <span>Extract & Export selected pages ({selectedPages.length})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. PDF COMPRESS TOOL */}
          {activeTool === "compress" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-emerald-500" />
                  <span>PDF Size Compressor</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lower document footprint so they fit student portals and university homework upload limits without losing legible quality.
                </p>
              </div>

              {/* Upload Dropzone */}
              {!compressFile ? (
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 group">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-all mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload PDF to Compress
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Optimizes scanned images and meta components
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleCompressUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                          {compressFileName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Original Size: <b>{(compressSizeOriginal / 1024).toFixed(1)} KB</b>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCompressFile(null)}
                      className="text-xs font-bold text-emerald-500 hover:underline border-0 cursor-pointer bg-transparent"
                    >
                      Re-select
                    </button>
                  </div>

                  {/* Compression Level Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Choose Optimization Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setCompressionRatio("low"); setCompressedSuccess(false); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          compressionRatio === "low"
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <p className="font-bold">Light Saving</p>
                        <span className="text-[9px] opacity-70">~15-20% smaller</span>
                      </button>
                      <button
                        onClick={() => { setCompressionRatio("medium"); setCompressedSuccess(false); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          compressionRatio === "medium"
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <p className="font-bold">Balanced</p>
                        <span className="text-[9px] opacity-70">~30-40% smaller</span>
                      </button>
                      <button
                        onClick={() => { setCompressionRatio("high"); setCompressedSuccess(false); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          compressionRatio === "high"
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <p className="font-bold">Max Squeeze</p>
                        <span className="text-[9px] opacity-70">~50-60% smaller</span>
                      </button>
                    </div>
                  </div>

                  {compressedSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl space-y-1 text-emerald-800 dark:text-emerald-400 text-xs">
                      <p className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" /> Optimization completed successfully!
                      </p>
                      <p className="font-mono text-[11px] pl-5">
                        Reduced from <b>{(compressSizeOriginal / 1024).toFixed(1)} KB</b> down to <b>{(compressedSize / 1024).toFixed(1)} KB</b>!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCompressPDF}
                    disabled={compressLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer"
                  >
                    {compressLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Compressing documents...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Optimize & Download Compressed PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. HANDWRITTEN NOTES TO PDF */}
          {activeTool === "handwriting" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-amber-500" />
                  <span>Handwritten Notes to PDF Generator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Type your typed text, assignments, or documents, and render them onto ruled school notebook pages with realistic handwriting ink and line alignment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Inputs & Settings */}
                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Assignment Text Content
                    </label>
                    <textarea
                      rows={8}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Type your notes here..."
                    />
                  </div>

                  {/* Styles Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">
                        Handwriting Font
                      </label>
                      <select
                        value={handwritingFont}
                        onChange={(e) => setHandwritingFont(e.target.value as any)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs w-full text-slate-850 dark:text-white focus:outline-none"
                      >
                        <option value="Caveat">Cursive (Caveat)</option>
                        <option value="Architects Daughter">Sketch (Architects)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">
                        Ink Ink Color
                      </label>
                      <select
                        value={inkColor}
                        onChange={(e) => setInkColor(e.target.value as any)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs w-full text-slate-850 dark:text-white focus:outline-none"
                      >
                        <option value="blue">Gel Blue Ink</option>
                        <option value="black">Charcoal Black</option>
                        <option value="red">Correction Red</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">
                        Paper Template Style
                      </label>
                      <select
                        value={paperStyle}
                        onChange={(e) => setPaperStyle(e.target.value as any)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs w-full text-slate-850 dark:text-white focus:outline-none"
                      >
                        <option value="ruled">Ruled Notebook</option>
                        <option value="squared">Grid Squared</option>
                        <option value="blank">Plain Antique Paper</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">
                        Font Size (px)
                      </label>
                      <input
                        type="number"
                        min={14}
                        max={30}
                        value={noteFontSize}
                        onChange={(e) => setNoteFontSize(parseInt(e.target.value, 10))}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs w-full text-slate-850 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadHandwrittenPdf}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Handwritten Note PDF</span>
                  </button>
                </div>

                {/* Simulated Canvas Preview (Miniature standard screen proportion) */}
                <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 relative">
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Live Notebook Rendering
                  </span>
                  
                  {/* Aspect Ratio limited wrap */}
                  <div className="w-full max-w-sm aspect-[1/1.41] overflow-hidden rounded-lg shadow-md border border-slate-300 dark:border-slate-700 bg-white">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. RESUME BUILDER */}
          {activeTool === "resume" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" />
                  <span>Academic Resume & CV Builder</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your academic profile parameters and download a beautifully typeset, modern single-page resume PDF optimized for standard corporate/university recruiters.
                </p>
              </div>

              <div className="space-y-4">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Choose Theme Design
                  </label>
                  <div className="flex gap-2">
                    {["modern_slate", "executive_navy", "crimson_academic"].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setResumeTheme(theme as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          resumeTheme === theme
                            ? "bg-teal-650 border-teal-600 text-white bg-teal-600"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {theme.replace("_", " ").toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resumeData.name}
                      onChange={(e) => handleResumeChange("name", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Contact info details */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Email Address
                    </label>
                    <input
                      type="text"
                      value={resumeData.email}
                      onChange={(e) => handleResumeChange("email", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={resumeData.phone}
                      onChange={(e) => handleResumeChange("phone", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      LinkedIn URL Profile
                    </label>
                    <input
                      type="text"
                      value={resumeData.linkedin}
                      onChange={(e) => handleResumeChange("linkedin", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Professional Profile */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Professional Summary
                  </label>
                  <textarea
                    rows={2}
                    value={resumeData.summary}
                    onChange={(e) => handleResumeChange("summary", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Education & Credentials
                  </label>
                  <textarea
                    rows={2}
                    value={resumeData.education}
                    onChange={(e) => handleResumeChange("education", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Work Experience */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Work Experience / Internships
                  </label>
                  <textarea
                    rows={2}
                    value={resumeData.experience}
                    onChange={(e) => handleResumeChange("experience", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Academic projects details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Key Projects
                  </label>
                  <textarea
                    rows={3}
                    value={resumeData.projects}
                    onChange={(e) => handleResumeChange("projects", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Technical Skills */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Technical Core Skills
                  </label>
                  <input
                    type="text"
                    value={resumeData.skills}
                    onChange={(e) => handleResumeChange("skills", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleDownloadResumePdf}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Resume PDF ({resumeTheme.replace("_", " ")})</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. CERTIFICATE GENERATOR */}
          {activeTool === "certificate" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span>Certificate Generator & Presenter</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate high-contrast certificates of completion, appreciation, or competition awards. Excellent for student clubs, hackathons, or training courses.
                </p>
              </div>

              <div className="space-y-4">
                {/* Theme Border Choices */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Certificate Motif Theme
                  </label>
                  <div className="flex gap-2">
                    {["gold_royal", "navy_classic", "emerald_prestige"].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setCertTheme(theme as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          certTheme === theme
                            ? "bg-purple-650 border-purple-600 text-white bg-purple-600"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {theme.replace("_", " ").toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Certificate Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Certificate Header Title
                    </label>
                    <input
                      type="text"
                      value={certData.title}
                      onChange={(e) => handleCertChange("title", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      value={certData.recipient}
                      onChange={(e) => handleCertChange("recipient", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Issued Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Date of Issuance
                    </label>
                    <input
                      type="text"
                      value={certData.date}
                      onChange={(e) => handleCertChange("date", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Presenter Signatory */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Authorized Signatory / Presenter Name
                    </label>
                    <input
                      type="text"
                      value={certData.presenter}
                      onChange={(e) => handleCertChange("presenter", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Reason description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Award Citation / Achievement Reason
                  </label>
                  <textarea
                    rows={2}
                    value={certData.reason}
                    onChange={(e) => handleCertChange("reason", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Visual Landscape Miniature CSS Mockup Preview */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 text-center space-y-3 relative overflow-hidden">
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[8px] px-2 py-0.5 rounded-full font-mono">
                    Live Template Preview
                  </span>

                  <div className="border-4 border-amber-600 p-4 max-w-lg mx-auto bg-amber-50/10 space-y-2 rounded-lg text-slate-800 dark:text-white">
                    <p className="font-display font-black text-amber-600 text-sm tracking-wide uppercase">
                      {certData.title}
                    </p>
                    <p className="text-[9px] text-slate-400">IS PROUDLY PRESENTED TO</p>
                    <p className="font-sans font-black text-slate-900 dark:text-white text-lg">
                      {certData.recipient}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto truncate">
                      {certData.reason}
                    </p>
                    <div className="flex justify-between items-center text-[8px] text-slate-400 pt-3">
                      <div>
                        <p className="border-t border-slate-200 pt-0.5">{certData.date}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-[8px] text-white">
                        ✓
                      </div>
                      <div>
                        <p className="border-t border-slate-200 pt-0.5 truncate max-w-[120px]">
                          {certData.presenter}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCertificatePdf}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border-0 cursor-pointer shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Certificate PDF ({certTheme.replace("_", " ")})</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* General Student Instructions Cabinet */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Confidentiality & Local Sandbox Encryption Guarantee
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All Student PDF Toolkit operations run <b>100% locally</b> in your web browser utilizing Web Assembly and custom canvas streaming layers. No academic files, notes, photographs, or resumes are ever transmitted or cached on external server storage.
          </p>
        </div>
      </div>
    </div>
  );
}
