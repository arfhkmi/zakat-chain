export enum JenisKiraan {
  TANPA_TOLAKAN = 'TANPA_TOLAKAN',
  DENGAN_TOLAKAN = 'DENGAN_TOLAKAN',
}

export enum JenisPendapatan {
  BULANAN = 'BULANAN',
  TAHUNAN = 'TAHUNAN',
}

// ---------------------------------------------------------------------------
// Tanpa Tolakan
// ---------------------------------------------------------------------------
export class TanpaTolakan {
  /** User picks BULANAN or TAHUNAN, then fills one of the two fields below */
  jenisPendapatan: JenisPendapatan;

  /** Required when jenisPendapatan = BULANAN */
  pendapatanBulanan?: number;

  /** Required when jenisPendapatan = TAHUNAN */
  pendapatanTahunan?: number;

  /** Bonus, sewaan, pencen, hadiah, etc. (annual lump-sum) */
  pendapatanLain?: number;

  /** Zakat already deducted by employer / agency (annual) */
  carumanBerzakat?: number;
}

// ---------------------------------------------------------------------------
// Dengan Tolakan
// ---------------------------------------------------------------------------
export class TolakanDeductions {
  /** Number of wives, RM 5,000 each, max 4 */
  bilIsteri: number;

  /** Number of children under 18, RM 2,000 each */
  bilAnakBawah18: number;

  /** Number of children 18+ studying, RM 5,000 each */
  bilAnakAtas18Belajar: number;

  /** Ibu Bapa – free-form, user enters own amount */
  ibubapa: number;

  /** KWSP deduction percentage (e.g. 11 for 11%), applied on gross annual salary */
  kwspPeratus: number;

  /** Self-education expenses, capped at RM 2,000/year */
  pendidikanSendiri: number;
}

export class DenganTolakan {
  jenisPendapatan: JenisPendapatan;
  pendapatanBulanan?: number;
  pendapatanTahunan?: number;
  pendapatanLain?: number;
  carumanBerzakat?: number;
  tolakan: TolakanDeductions;
}

// ---------------------------------------------------------------------------
// Main request DTO
// ---------------------------------------------------------------------------
export class ZakatRequestDto {
  jenisKiraan: JenisKiraan;

  /** Populate when jenisKiraan = TANPA_TOLAKAN */
  tanpaTolakan?: TanpaTolakan;

  /** Populate when jenisKiraan = DENGAN_TOLAKAN */
  denganTolakan?: DenganTolakan;
}