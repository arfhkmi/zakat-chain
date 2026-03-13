import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ZakatRequestDto,
  JenisKiraan,
  JenisPendapatan,
  TanpaTolakan,
  DenganTolakan,
} from './zakat_dto';

const NISAB_2026 = 33_996;
const ZAKAT_RATE = 0.025;

const DEDUCTION_RATES = {
  diriSendiri: 12_000,
  isteri: 5_000,
  anakBawah18: 2_000,
  anakAtas18Belajar: 5_000,
  pendidikanSendiriCap: 2_000,
};

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------
export interface TolakanPerincian {
  diriSendiri: number;
  isteri: number;
  anakBawah18: number;
  anakAtas18Belajar: number;
  ibubapa: number;
  kwsp: number;
  pendidikanSendiri: number;
  jumlah: number;
}

export interface ZakatResult {
  nisab: number;
  jumlahPendapatanTahunan: number;
  jumlahTolakan?: number;
  jumlahPendapatanLayakDiZakat: number;
  carumanBerzakat: number;
  jumlahSelepasCaruman: number;
  layakBerzakat: boolean;
  zakatSetahun: number;
  zakatBulanan: number;
  tolakanPerincian?: TolakanPerincian;
}

@Injectable()
export class ZakatService {
  calculate(dto: ZakatRequestDto): ZakatResult {
    switch (dto.jenisKiraan) {
      case JenisKiraan.TANPA_TOLAKAN:
        if (!dto.tanpaTolakan) {
          throw new BadRequestException(
            'tanpaTolakan object is required for TANPA_TOLAKAN mode.',
          );
        }
        return this.hitungTanpaTolakan(dto.tanpaTolakan);

      case JenisKiraan.DENGAN_TOLAKAN:
        if (!dto.denganTolakan) {
          throw new BadRequestException(
            'denganTolakan object is required for DENGAN_TOLAKAN mode.',
          );
        }
        return this.hitungDenganTolakan(dto.denganTolakan);

      default:
        throw new BadRequestException('jenisKiraan tidak sah.');
    }
  }

  // -------------------------------------------------------------------------
  // Mode 1: Tanpa Tolakan
  // -------------------------------------------------------------------------
  private hitungTanpaTolakan(data: TanpaTolakan): ZakatResult {
    const pendapatanTahunan = this.annualize(
      data.jenisPendapatan,
      data.pendapatanBulanan,
      data.pendapatanTahunan,
    );

    const pendapatanLain = data.pendapatanLain ?? 0;
    const jumlahPendapatanTahunan = pendapatanTahunan + pendapatanLain;
    const carumanBerzakat = data.carumanBerzakat ?? 0;

    const layakBerzakat = jumlahPendapatanTahunan >= NISAB_2026;

    if (!layakBerzakat) {
      return this.buildResult({
        jumlahPendapatanTahunan,
        carumanBerzakat,
        layakBerzakat: false,
      });
    }

    const zakatSetahunKotor = round2(jumlahPendapatanTahunan * ZAKAT_RATE);
    const jumlahSelepasCaruman = Math.max(0, zakatSetahunKotor - carumanBerzakat);

    return this.buildResult({
      jumlahPendapatanTahunan,
      carumanBerzakat,
      layakBerzakat: true,
      zakatSetahunKotor,
      jumlahSelepasCaruman,
    });
  }

  // -------------------------------------------------------------------------
  // Mode 2: Dengan Tolakan
  // -------------------------------------------------------------------------
  private hitungDenganTolakan(data: DenganTolakan): ZakatResult {
    const pendapatanGajiTahunan = this.annualize(
      data.jenisPendapatan,
      data.pendapatanBulanan,
      data.pendapatanTahunan,
    );

    const pendapatanLain = data.pendapatanLain ?? 0;
    const jumlahPendapatanTahunan = pendapatanGajiTahunan + pendapatanLain;
    const carumanBerzakat = data.carumanBerzakat ?? 0;

    const t = data.tolakan;

    // Clamp inputs
    const bilIsteri = Math.min(Math.max(0, t.bilIsteri ?? 0), 4);
    const bilAnakBawah18 = Math.max(0, t.bilAnakBawah18 ?? 0);
    const bilAnakAtas18Belajar = Math.max(0, t.bilAnakAtas18Belajar ?? 0);
    const kwspPeratus = Math.min(Math.max(0, t.kwspPeratus ?? 0), 100);

    // Calculate each deduction item
    const diriSendiri = DEDUCTION_RATES.diriSendiri; 
    const isteri = bilIsteri * DEDUCTION_RATES.isteri;
    const anakBawah18 = bilAnakBawah18 * DEDUCTION_RATES.anakBawah18;
    const anakAtas18Belajar = bilAnakAtas18Belajar * DEDUCTION_RATES.anakAtas18Belajar;
    const ibubapa = Math.max(0, t.ibubapa ?? 0);

    // KWSP applies only on salary portion (not pendapatanLain)
    const kwsp = round2((kwspPeratus / 100) * pendapatanGajiTahunan);

    // Pendidikan sendiri is capped
    const pendidikanSendiri = Math.min(
      Math.max(0, t.pendidikanSendiri ?? 0),
      DEDUCTION_RATES.pendidikanSendiriCap,
    );

    const jumlahTolakan = round2(
      diriSendiri +
        isteri +
        anakBawah18 +
        anakAtas18Belajar +
        ibubapa +
        kwsp +
        pendidikanSendiri,
    );

    const jumlahPendapatanLayakDiZakat = Math.max(
      0,
      round2(jumlahPendapatanTahunan - jumlahTolakan),
    );

    const layakBerzakat = jumlahPendapatanLayakDiZakat >= NISAB_2026;

    const tolakanPerincian: TolakanPerincian = {
      diriSendiri,
      isteri,
      anakBawah18,
      anakAtas18Belajar,
      ibubapa,
      kwsp,
      pendidikanSendiri,
      jumlah: jumlahTolakan,
    };

    if (!layakBerzakat) {
      return this.buildResult({
        jumlahPendapatanTahunan,
        jumlahTolakan,
        jumlahPendapatanLayakDiZakat,
        carumanBerzakat,
        layakBerzakat: false,
        tolakanPerincian,
      });
    }

    const zakatSetahunKotor = round2(jumlahPendapatanLayakDiZakat * ZAKAT_RATE);
    const jumlahSelepasCaruman = Math.max(0, zakatSetahunKotor - carumanBerzakat);

    return this.buildResult({
      jumlahPendapatanTahunan,
      jumlahTolakan,
      jumlahPendapatanLayakDiZakat,
      carumanBerzakat,
      layakBerzakat: true,
      zakatSetahunKotor,
      jumlahSelepasCaruman,
      tolakanPerincian,
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  private annualize(
    jenis: JenisPendapatan,
    bulanan?: number,
    tahunan?: number,
  ): number {
    if (jenis === JenisPendapatan.BULANAN) {
      if (!bulanan || bulanan < 0) {
        throw new BadRequestException(
          'pendapatanBulanan diperlukan apabila jenisPendapatan = BULANAN.',
        );
      }
      return round2(bulanan * 12);
    }

    if (jenis === JenisPendapatan.TAHUNAN) {
      if (!tahunan || tahunan < 0) {
        throw new BadRequestException(
          'pendapatanTahunan diperlukan apabila jenisPendapatan = TAHUNAN.',
        );
      }
      return tahunan;
    }

    throw new BadRequestException('jenisPendapatan tidak sah.');
  }

  private buildResult(params: {
    jumlahPendapatanTahunan: number;
    jumlahTolakan?: number;
    jumlahPendapatanLayakDiZakat?: number;
    carumanBerzakat: number;
    layakBerzakat: boolean;
    zakatSetahunKotor?: number;
    jumlahSelepasCaruman?: number;
    tolakanPerincian?: TolakanPerincian;
  }): ZakatResult {
    const {
      jumlahPendapatanTahunan,
      jumlahTolakan,
      jumlahPendapatanLayakDiZakat,
      carumanBerzakat,
      layakBerzakat,
      jumlahSelepasCaruman,
      tolakanPerincian,
    } = params;

    const effectiveLayak = jumlahPendapatanLayakDiZakat ?? jumlahPendapatanTahunan;
    const zakatSetahun = jumlahSelepasCaruman ?? 0;
    const zakatBulanan = round2(zakatSetahun / 12);

    return {
      nisab: NISAB_2026,
      jumlahPendapatanTahunan,
      ...(jumlahTolakan !== undefined && { jumlahTolakan }),
      jumlahPendapatanLayakDiZakat: effectiveLayak,
      carumanBerzakat,
      jumlahSelepasCaruman: jumlahSelepasCaruman ?? 0,
      layakBerzakat,
      zakatSetahun,
      zakatBulanan,
      ...(tolakanPerincian && { tolakanPerincian }),
    };
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}