import { FormData, FormContentItem } from "../app/form-types";

// Extends FormData to match what's stored in submissions
export interface SubmissionData extends Omit<FormData, "contentItems"> {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewStatus: "pending" | "approved" | "rejected";
  validationStatus?: "validated" | "published" | "rejected";
  workflowStage: "form" | "review" | "validation" | "completed";
  submitterId: string;
  submitterName: string;
  contentItems: FormContentItem[];
  isConfirmed?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  validatedBy?: string;
  validatedAt?: string;
  validationNotes?: string;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Helper to create a date relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFuture = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// Base mock content item
const baseContentItem = (overrides: Partial<FormContentItem> = {}): FormContentItem => ({
  id: generateId(),
  jenisKonten: "Video Pendek",
  nama: "Konten Reels Kegiatan",
  nomorSurat: `00${Math.floor(Math.random() * 9) + 1}/KOMINFO/2026`,
  tanggalOrderMasuk: daysAgo(5),
  tanggalJadi: daysAgo(2),
  tanggalTayang: daysFuture(1),
  mediaPemerintah: ["Instagram", "Tiktok"],
  mediaMassa: [],
  narasiSourceType: ["Teks"],
  narasiText: "Berikut adalah laporan kegiatan harian yang telah kami susun dengan baik.",
  narasiFile: null,
  suratFile: null,
  audioDubbingSourceType: [],
  audioDubbingFile: null,
  audioDubbingLainLainFile: null,
  audioBacksoundSourceType: [],
  audioBacksoundFile: null,
  audioBacksoundLainLainFile: null,
  pendukungLainnyaSourceType: [],
  pendukungVideoFile: null,
  pendukungFotoFile: null,
  pendukungLainLainFile: null,
  keterangan: "Mohon segera diproses",
  ...overrides
});

// Helper to create submission
const createSubmission = (
  id: string,
  tema: string,
  judul: string,
  petugas: string,
  supervisor: string,
  daysOld: number,
  stage: "submitted" | "review" | "validation" | "completed" | "rejected_review" | "rejected_validation",
  items: Partial<FormContentItem>[]
): SubmissionData => {
  const createdAt = daysAgo(daysOld).toISOString();
  
  let status: "pending" | "approved" | "rejected" = "pending";
  let reviewStatus: "pending" | "approved" | "rejected" = "pending";
  let validationStatus: "validated" | "published" | "rejected" | undefined = undefined;
  let workflowStage: SubmissionData["workflowStage"] = "review";

  let reviewedBy = undefined;
  let reviewedAt = undefined;
  let reviewNotes = undefined;

  let validatedBy = undefined;
  let validatedAt = undefined;
  let validationNotes = undefined;

  let isConfirmed = true;

  if (stage === "submitted") {
    status = "pending";
    reviewStatus = "pending";
    workflowStage = "form";
    isConfirmed = false;
  } else if (stage === "review") {
    status = "pending";
    reviewStatus = "pending";
    workflowStage = "review";
  } else if (stage === "rejected_review") {
    status = "rejected";
    reviewStatus = "rejected";
    workflowStage = "completed";
    reviewedBy = "3";
    reviewedAt = daysAgo(daysOld - 1).toISOString();
    reviewNotes = "Narasi kurang sesuai dengan panduan Diskominfo, mohon direvisi.";
  } else if (stage === "validation") {
    status = "approved";
    reviewStatus = "approved";
    workflowStage = "validation";
    reviewedBy = "3";
    reviewedAt = daysAgo(daysOld - 1).toISOString();
    reviewNotes = "Konten sudah sesuai, dilanjutkan ke tahap validasi.";
  } else if (stage === "rejected_validation") {
    status = "rejected";
    reviewStatus = "approved"; // passed review
    validationStatus = "rejected";
    workflowStage = "completed";
    reviewedBy = "3";
    reviewedAt = daysAgo(daysOld - 1).toISOString();
    validatedBy = "4";
    validatedAt = daysAgo(daysOld - 2).toISOString();
    validationNotes = "Kualitas video kurang baik dan audionya pecah saat ditayangkan di platform.";
  } else if (stage === "completed") {
    status = "approved";
    reviewStatus = "approved";
    validationStatus = "published";
    workflowStage = "completed";
    reviewedBy = "3";
    reviewedAt = daysAgo(daysOld - 1).toISOString();
    validatedBy = "4";
    validatedAt = daysAgo(daysOld - 2).toISOString();
    validationNotes = "Konten telah berhasil diverifikasi dan disetujui untuk rilis.";
  }

  return {
    id,
    tema,
    judul,
    petugasPelaksana: petugas,
    supervisor,
    contentItems: items.map(item => baseContentItem(item)),
    buktiMengetahui: null,
    dokumenPendukung: [],
    noComtab: `CMB-2026-${id.split("-")[1]}`,
    pinSandi: "",
    createdAt,
    updatedAt: daysAgo(daysOld - (stage === "review" ? 0 : 2)).toISOString(),
    status,
    reviewStatus,
    validationStatus,
    workflowStage,
    submitterId: "2",
    submitterName: "Form User",
    isConfirmed,
    reviewedBy,
    reviewedAt,
    reviewNotes,
    validatedBy,
    validatedAt,
    validationNotes,
  };
};

export const dummySubmissions: SubmissionData[] = [
  // --- SUBMITTED (WAITING FOR CONFIRMATION / BARU DIAJUKAN) ---
  createSubmission("sub-0001", "Pelayanan Kependudukan", "Jadwal Pelayanan Keliling", "Form User", "Content Reviewer", 1, "submitted", [
    { jenisKonten: "Infografis", nama: "Jadwal Dispendukcapil Keliling" }
  ]),
  createSubmission("sub-0002", "Pendidikan", "Sosialisasi Beasiswa Pemda", "Form User", "Content Reviewer", 0.5, "submitted", [
    { jenisKonten: "Poster", nama: "Poster Pendaftaran Beasiswa" },
    { jenisKonten: "Video Pendek", nama: "Video Testimoni Alumni" }
  ]),
  createSubmission("sub-0003", "Kesehatan", "Vaksinasi Massal Gratis", "Form User", "Content Reviewer", 0, "submitted", [
    { jenisKonten: "Poster", nama: "Pengumuman Vaksinasi Balita" }
  ]),

  // --- REVIEW (WAITING FOR REVIEW / PROSES TINJAUAN) ---
  createSubmission("sub-3001", "Peringatan Hari Nasional", "Ucapan Hari Kemerdekaan RI Ke-81", "Form User", "Content Reviewer", 1, "review", [
    { jenisKonten: "Poster", nama: "Poster 17 Agustus 2026", tanggalTayang: daysFuture(10) }
  ]),
  createSubmission("sub-3002", "Prestasi Daerah", "Penghargaan Adipura Kencana", "Content Reviewer", "Content Reviewer", 2, "review", [
    { jenisKonten: "Artikel", nama: "Artikel Kemenangan Adipura", tanggalTayang: daysFuture(1) },
    { jenisKonten: "Infografis", nama: "Fakta Kebersihan Kota", tanggalTayang: daysFuture(2) }
  ]),
  createSubmission("sub-3003", "Bencana Alam", "Himbauan Waspada Cuaca Ekstrem", "Form User", "Content Reviewer", 0.1, "review", [
    { jenisKonten: "Video Pendek", nama: "Himbauan BPBD", mediaPemerintah: ["Instagram", "Facebook", "Twitter"], tanggalTayang: daysFuture(0) }
  ]),
  createSubmission("sub-6004", "Keamanan Lingkungan", "Sistem Keamanan Terpadu", "Content Reviewer", "Content Reviewer", 2, "review", [
    { jenisKonten: "Artikel", nama: "Rilis Berita Keamanan Siskamling", tanggalTayang: daysFuture(1) }
  ]),

  // --- VALIDATION (WAITING FOR VALIDATION / MENUNGGU VALIDASI FINAL) ---
  createSubmission("sub-2001", "Promosi Pariwisata", "Video Reels Destinasi Wisata Alam", "Form User", "Content Validator", 4, "validation", [
    { jenisKonten: "Video Reels", nama: "Reels Air Terjun Coban Rais", tanggalTayang: daysFuture(2) }
  ]),
  createSubmission("sub-2002", "Ekonomi Kreatif", "Profil UMKM Khas Batu", "Form User", "Content Reviewer", 3, "validation", [
    { jenisKonten: "Video Pendek", nama: "Profil Pengrajin Apel", tanggalTayang: daysFuture(4) }
  ]),
  createSubmission("sub-2003", "Layanan Publik", "Panduan Pembuatan KTP Digital", "Form User", "Content Reviewer", 2, "validation", [
    { jenisKonten: "Infografis", nama: "Alur Pendaftaran Identitas Digital", tanggalTayang: daysFuture(1) }
  ]),

  // --- COMPLETED (PUBLISHED / SELESAI & TAYANG) ---
  createSubmission("sub-1001", "Edukasi Masyarakat", "Sosialisasi Program Layanan Publik Terpadu", "Form User", "Content Reviewer", 10, "completed", [
    { jenisKonten: "Infografis", nama: "Desain Infografis Layanan", tanggalTayang: daysAgo(7) },
    { jenisKonten: "Video Pendek", nama: "Reels Tutorial Layanan", tanggalTayang: daysAgo(7) }
  ]),
  createSubmission("sub-1002", "Peringatan Hari Besar", "Ucapan Selamat Idul Fitri 1447 H", "Form User", "Content Reviewer", 45, "completed", [
    { jenisKonten: "Poster", nama: "Poster Ucapan Walikota", tanggalTayang: daysAgo(42) }
  ]),
  createSubmission("sub-1003", "Kesehatan", "Kampanye Anti Stunting Kota Batu", "Form User", "Content Validator", 20, "completed", [
    { jenisKonten: "Video Dokumenter", nama: "Dokumenter Posyandu", tanggalTayang: daysAgo(15) }
  ]),
  createSubmission("sub-6003", "Olahraga", "Turnamen Futsal Walikota Cup", "Form User", "Content Reviewer", 35, "completed", [
    { jenisKonten: "Video Highlight", nama: "Highlight Pertandingan Final", tanggalTayang: daysAgo(30) }
  ]),

  // --- REJECTED (DITOLAK) ---
  createSubmission("sub-4001", "Sosialisasi Perda", "Aturan Parkir Baru di Alun-Alun", "Form User", "Content Reviewer", 5, "rejected_review", [
    { jenisKonten: "Video Animasi", nama: "Animasi Tata Tertib Parkir" }
  ]),
  createSubmission("sub-6005", "Sosialisasi Pemilu", "Panduan Pencoblosan Pemula", "Form User", "Content Reviewer", 8, "rejected_review", [
    { jenisKonten: "Video Animasi", nama: "Animasi Tata Cara Coblos", tanggalTayang: daysFuture(5) }
  ]),
  createSubmission("sub-5001", "Investasi", "Peluang Investasi Kota Batu 2026", "Form User", "Content Reviewer", 15, "rejected_validation", [
    { jenisKonten: "Video Dokumenter", nama: "Profil Investasi", tanggalTayang: daysAgo(12) }
  ]),
];
