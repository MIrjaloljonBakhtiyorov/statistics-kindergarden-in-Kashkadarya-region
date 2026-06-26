export type CertificateStatus = "issued" | "downloaded" | "sent";

export interface Certificate {
  id: string;
  certificateNumber: string;
  title: string;
  competition: string;
  project: string;
  stage: string;
  result: string;
  issuedAt: string;
  status: CertificateStatus;
  qrCode: string;
}

export const mockCertificates: Certificate[] = [
  {
    id: "cert_001",
    certificateNumber: "QSL-CERT-2024-0014",
    title: "Viloyat finali ishtirokchisi",
    competition: "Qashqadaryo Startup Ligasi 2024",
    project: "AgroAI Monitor",
    stage: "Viloyat finali",
    result: "Finalchi",
    issuedAt: "2024-09-30",
    status: "issued",
    qrCode: "https://qsl.uz/verify/QSL-CERT-2024-0014",
  },
  {
    id: "cert_002",
    certificateNumber: "QSL-CERT-2024-0007",
    title: "OTM saralashi g'olibi",
    competition: "Qashqadaryo Startup Ligasi 2024",
    project: "InterLearn Platform",
    stage: "OTM saralashi",
    result: "OTM g'olibi — 1-o'rin",
    issuedAt: "2024-08-20",
    status: "downloaded",
    qrCode: "https://qsl.uz/verify/QSL-CERT-2024-0007",
  },
];
