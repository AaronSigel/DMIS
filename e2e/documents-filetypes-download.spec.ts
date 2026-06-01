import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type DocumentView = {
  id: string;
};

type DocumentsListResponse = {
  content?: DocumentView[];
};

type DownloadUrlResponse = {
  url?: string;
};

const API_BASE = 'http://127.0.0.1:8080';
const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';

function createMinimalPdfBuffer(): Buffer {
  const lines = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>',
    'endobj',
    '4 0 obj',
    '<< /Length 34 >>',
    'stream',
    'BT /F1 12 Tf 72 72 Td (hello) Tj ET',
    'endstream',
    'endobj',
  ];

  let body = `${lines.join('\n')}\n`;
  const xrefOffset = Buffer.byteLength(body, 'utf8');
  const objectOffsets = [0];
  let scanAt = 0;
  for (let i = 1; i <= 4; i += 1) {
    const marker = `${i} 0 obj`;
    const idx = body.indexOf(marker, scanAt);
    objectOffsets.push(idx);
    scanAt = idx + marker.length;
  }

  body += 'xref\n';
  body += `0 ${objectOffsets.length}\n`;
  body += '0000000000 65535 f \n';
  for (let i = 1; i < objectOffsets.length; i += 1) {
    body += `${String(objectOffsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += 'trailer\n';
  body += `<< /Size ${objectOffsets.length} /Root 1 0 R >>\n`;
  body += 'startxref\n';
  body += `${xrefOffset}\n`;
  body += '%%EOF\n';

  return Buffer.from(body, 'utf8');
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createMinimalDocxBuffer(): Buffer {
  const entries = [
    {
      name: '[Content_Types].xml',
      content: Buffer.from(
        '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
          '</Types>',
        'utf8',
      ),
    },
    {
      name: '_rels/.rels',
      content: Buffer.from(
        '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
          '</Relationships>',
        'utf8',
      ),
    },
    {
      name: 'word/document.xml',
      content: Buffer.from(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
          '<w:body><w:p><w:r><w:t>Hello DOCX</w:t></w:r></w:p></w:body>' +
          '</w:document>',
        'utf8',
      ),
    },
  ];

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const content = entry.content;
    const crc = crc32(content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localDirectory = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localDirectory.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localDirectory, centralDirectory, end]);
}

async function uploadDocument(
  request: import('@playwright/test').APIRequestContext,
  headers: { Authorization: string },
  file: { name: string; mimeType: string; buffer: Buffer },
): Promise<string> {
  const uploadResponse = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file,
    },
  });

  if (!uploadResponse.ok()) {
    const bodyText = await uploadResponse.text();
    throw new Error(`Upload failed (${uploadResponse.status()}): ${bodyText}`);
  }
  const uploaded = (await uploadResponse.json()) as DocumentView;
  expect(uploaded.id).toBeTruthy();
  return uploaded.id;
}

test('documents: pdf and docx uploads are list-visible and downloadable', async ({ request }) => {
  const token = await getAccessToken(request, { email: DEMO_EMAIL, password: DEMO_PASSWORD });
  const headers = { Authorization: `Bearer ${token}` };

  const pdfId = await uploadDocument(request, headers, {
    name: `filetypes-${Date.now()}.pdf`,
    mimeType: 'application/pdf',
    buffer: createMinimalPdfBuffer(),
  });

  const docxId = await uploadDocument(request, headers, {
    name: `filetypes-${Date.now()}-doc.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: createMinimalDocxBuffer(),
  });

  expect(pdfId).not.toBe(docxId);

  for (const id of [pdfId, docxId]) {
    const detailsResponse = await request.get(`${API_BASE}/api/documents/${encodeURIComponent(id)}`, {
      headers,
    });
    expect(detailsResponse.status()).toBe(200);

    const downloadUrlResponse = await request.get(
      `${API_BASE}/api/documents/${encodeURIComponent(id)}/download-url`,
      { headers },
    );
    expect(downloadUrlResponse.status()).toBe(200);
    const downloadUrlBody = (await downloadUrlResponse.json()) as DownloadUrlResponse;
    expect((downloadUrlBody.url ?? '').trim().length).toBeGreaterThan(0);

    const binaryResponse = await request.get(`${API_BASE}/api/documents/${encodeURIComponent(id)}/binary`, {
      headers,
    });
    expect(binaryResponse.status()).toBe(200);
    const binaryBody = await binaryResponse.body();
    expect(binaryBody.byteLength).toBeGreaterThan(0);
  }

  await expect
    .poll(
      async () => {
        const listResponse = await request.get(`${API_BASE}/api/documents`, { headers });
        expect(listResponse.status()).toBe(200);
        const listBody = (await listResponse.json()) as DocumentsListResponse;
        const ids = new Set((listBody.content ?? []).map((doc) => doc.id));
        return ids.has(pdfId) && ids.has(docxId);
      },
      {
        message: 'Uploaded PDF and DOCX should both be present in /api/documents content list',
        timeout: 15000,
        intervals: [300, 700, 1500],
      },
    )
    .toBeTruthy();
});
