import os

def create_text_pdf(output_path: str, text_lines: list[str]):
    """
    Creates a valid text-based PDF file without third-party PDF generators
    so pdfplumber can extract the text cleanly.
    """
    # Build text stream
    stream_lines = ["BT", "/F1 12 Tf", "50 750 Td", "16 TL"]
    for i, line in enumerate(text_lines):
        clean = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if i == 0:
            stream_lines.append(f"({clean}) Tj")
        else:
            stream_lines.append(f"T* ({clean}) Tj")
    stream_lines.append("ET")
    stream_content = "\n".join(stream_lines)
    stream_len = len(stream_content)

    pdf = f"""%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length {stream_len}
>>
stream
{stream_content}
endstream
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000320 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
405
%%EOF
"""
    with open(output_path, "wb") as f:
        f.write(pdf.encode("latin-1"))

if __name__ == "__main__":
    lines = [
        "OFFICE OF THE EXECUTIVE ENGINEER",
        "KERALA WATER AUTHORITY (KWA)",
        "Tender Notice No. KWA/PHD/CHN/2026/W-104",
        "Name of Work: Laying of 450mm DI water mains along MG Road",
        "from Jos Junction to Padma Junction.",
        "Nature of Work: Underground water pipeline installation.",
        "Trench Depth: Depth shall maintain 1.8 meters below ground.",
        "Execution Period: within 90 days from letter of intent.",
        "Authority: Kerala Water Authority Kochi Division."
    ]
    out = os.path.join(os.path.dirname(__file__), "sample_tender.pdf")
    create_text_pdf(out, lines)
    print(f"Sample PDF created at {out}")
