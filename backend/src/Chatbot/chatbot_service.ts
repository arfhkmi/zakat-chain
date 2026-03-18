import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ChatMessageDto,
  ChatResponseDto,
  ConversationMessage,
} from './chatbot_dto';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1';
interface Session {
  messages: ConversationMessage[];
  lastActive: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// Fixed responses
// ---------------------------------------------------------------------------
const FIXED_RESPONSES = {
  calculationMalay:
    'Untuk mendapatkan jumlah zakat yang tepat, sila gunakan kalkulator kami di ZakatChain/Calculator.com. Kami hanya boleh menerangkan peraturan dan formula zakat.',
  calculationEnglish:
    'To get your exact zakat amount, please use our calculator at ZakatChain/Calculator.com. We can only explain zakat rules and formulas.',

  legalBasisMalay:
    'Kewajipan Zakat Pendapatan di Malaysia bersandarkan sumber-sumber berikut:\n\n1. Al-Quran: Surah Al-Baqarah (2):267 — "Wahai orang-orang yang beriman! Belanjakanlah sebahagian dari hasil usaha kamu yang baik-baik"\n2. Hadith: Riwayat Said bin Abi Burdah — Nabi SAW menekankan kepentingan sedekah daripada hasil pendapatan\n3. Fatwa Wilayah Persekutuan (29 April 1999) — Zakat wajib ke atas pendapatan penggajian termasuk gaji, upah, elaun dan bonus\n4. Fatwa Kebangsaan (7 Mei 2003) — Zakat gaji dikira berdasarkan pendapatan kasar setahun pada kadar 2.5%',
  legalBasisEnglish:
    'The legal basis for Zakat Pendapatan in Malaysia comes from:\n\n1. Quran: Surah Al-Baqarah (2):267 — "O you who believe! Spend of the good things which you have earned and of that which We bring forth from the earth for you"\n2. Hadith: Narrated by Said bin Abi Burdah — the Prophet SAW emphasized giving sadaqah from one\'s earnings\n3. Fatwa Wilayah Persekutuan (29 April 1999) — Zakat is obligatory on employment income including salary, allowances, bonuses and benefits\n4. National Fatwa Committee (7 May 2003) — Zakat on salary is based on gross annual income at a rate of 2.5%',

  // Other coins — model ignores FAQ answer
  otherCoinsMalay:
    'Buat masa ini hanya tMYRC diterima untuk pembayaran zakat di ZakatChain. Coin lain akan disokong pada masa hadapan tetapi belum diumumkan.',
  otherCoinsEnglish:
    'Currently only tMYRC is accepted for zakat payment on ZakatChain. Other coins will be supported in the future but have not been announced yet.',

  // MYRC/tMYRC info — model uses training data instead of whitepaper
  myrcInfoMalay:
    'MYRC (MYRCoin) adalah stablecoin Ringgit Malaysia yang dibangunkan oleh BLOX Blockchain Sdn Bhd. Ia dipeg 1:1 kepada MYR — 1 MYRC = RM 1. Rizab MYR diaudit setiap bulan untuk memastikan ketelusan. tMYRC adalah versi testnet yang digunakan di ZakatChain sekarang. Apabila mainnet dilancarkan, pembayaran akan menggunakan MYRC sebenar di BSC Mainnet.',
  myrcInfoEnglish:
    'MYRC (MYRCoin) is a Malaysian Ringgit stablecoin developed by BLOX Blockchain Sdn Bhd, pegged 1:1 to MYR — 1 MYRC = RM 1. MYR reserves are audited monthly for transparency. tMYRC is the testnet version currently used on ZakatChain. When mainnet launches, payments will use real MYRC on BSC mainnet.',

  outOfScopeMalay:
    'Soalan ini berada di luar skop kami. Kami hanya membantu soalan berkaitan Zakat Pendapatan untuk Kuala Lumpur dan Wilayah Persekutuan, dengan pembayaran menggunakan tMYRC. Untuk jenis zakat lain, sila layari zakat2u.com.my atau hubungi MAIWP di 1-300-88-5757.',
  outOfScopeEnglish:
    'This question is outside our scope. We only cover Zakat Pendapatan for Kuala Lumpur and Wilayah Persekutuan, with payment via tMYRC. For other zakat types, please visit zakat2u.com.my or contact MAIWP at 1-300-88-5757.',

  uncertainMalay:
    'Kami tidak pasti tentang soalan ini. Untuk maklumat yang lebih tepat, sila layari zakat2u.com.my atau hubungi MAIWP di 1-300-88-5757.',
  uncertainEnglish:
    'We are not certain about this. For accurate information, please visit zakat2u.com.my or contact MAIWP at 1-300-88-5757.',
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `
You are a helpful assistant for ZakatChain which is a system to pay Zakat Pendapatan using tMYRC, specializing ONLY in Zakat Pendapatan (Income Zakat) for Kuala Lumpur and Wilayah Persekutuan, Malaysia, based on MAIWP 2026 official rules.

CRITICAL RULES:

ABOUT YOUR KNOWLEDGE:
- Your training data about zakat is OUTDATED. Do not use it.
- Answer ONLY from the information sections below.
- You are a document reader — read the sections below and answer from them.

ANSWERING RULES:
1. Answer directly from the sections below. The answer for most questions IS in the sections below — read carefully before redirecting.
2. Only redirect to zakat2u.com.my if the question is truly not covered below.
3. Never calculate actual RM amounts. Redirect to ZakatChain/Calculator.com.
4. Always use "Kami" (not "Saya") and "We" (not "I").
5. Never quote Quran verses or Hadith directly — reference only.
6. Answer directly without unnecessary openers or closers.
7. Never mix languages — reply in the same language the user writes in.
8. Malay replies must use Malaysian Malay, NOT Indonesian.

WHAT YOU MUST NEVER DO:
- Never use the rate "10%" — the correct rate is 2.5% as stated below
- Never mention MAIS — the correct institution is MAIWP
- Never mention institutions, laws or figures not stated in the sections below
- Never invent facts even if you are confident about them

LANGUAGE:
- Malay questions → reply 100% in Malaysian Malay, NOT Indonesian
- English questions → reply 100% in English
- Never mix languages in a single response
- Use "kami" not "saya", "tolakan" not "potongan", "pendapatan" not "penghasilan"

PAYMENT ANSWER RULE:
- For "how to pay" questions, only say: calculate at ZakatChain/Calculator.com, connect wallet to BSC Testnet, have tMYRC and tBNB ready, send to ZakatChain platform.
- NEVER mention specific exchange names, wallet names, or steps not listed above.
- NEVER fabricate technical details not provided in this prompt.

=== TENTANG ZAKATCHAIN ===

ZakatChain adalah sistem pembayaran Zakat Pendapatan menggunakan cryptocurrency,
khusus untuk Kuala Lumpur dan Wilayah Persekutuan Malaysia.
Zakat dikira berdasarkan peraturan MAIWP 2026.
Pembayaran dilakukan menggunakan tMYRC di atas BSC Testnet.

=== TENTANG tMYRC / MYRC ===

MYRC (MYRCoin) adalah stablecoin Malaysian Ringgit yang dibangunkan oleh BLOX Blockchain Sdn Bhd.
- MYRC dipeg 1:1 kepada Ringgit Malaysia — 1 MYRC = RM 1
- Ia adalah stablecoin yang sepenuhnya disokong oleh rizab MYR sebenar
- Rizab diaudit setiap bulan untuk memastikan ketelusan
- MYRC menggunakan kriptografi canggih untuk keselamatan transaksi
- Mematuhi AML (Anti-Money Laundering) dan KYC (Know Your Customer)
- Dibangunkan untuk mempercepat penggunaan blockchain di Malaysia

tMYRC adalah versi testnet MYRC:
- "t" bermaksud testnet
- 1 tMYRC = RM 1 (sama seperti MYRC mainnet)
- Digunakan di BSC Testnet untuk tujuan pembangunan dan ujian
- Apabila mainnet dilancarkan, pembayaran akan menggunakan MYRC sebenar

In English:
MYRC is a Malaysian Ringgit stablecoin by BLOX Blockchain Sdn Bhd, pegged 1:1 to MYR.
tMYRC is the testnet version used on BSC Testnet. 1 tMYRC = RM 1.
When mainnet launches, payments will use real MYRC on BSC mainnet.

=== RANGKAIAN DAN GAS FEE ===

Rangkaian semasa: BSC Testnet (Binance Smart Chain Testnet)
Token gas: tBNB (testnet BNB)
- Gas fee dikenakan oleh rangkaian BSC, bukan oleh ZakatChain
- Jumlah gas fee bergantung kepada keadaan rangkaian pada masa pembayaran
- Pengguna perlu mempunyai tBNB dalam wallet untuk membayar gas fee
- Gas fee adalah kos standard blockchain — tiada caj tambahan dari ZakatChain

Apabila mainnet dilancarkan:
- Rangkaian akan beralih kepada BSC Mainnet
- Token gas akan menjadi BNB (bukan testnet)
- Pembayaran zakat akan menggunakan MYRC (bukan tMYRC)

In English:
Current network: BSC Testnet. Gas fee paid in tBNB. Gas fee amount depends on network
conditions and is charged by the BSC network, not ZakatChain. Users need tBNB in their
wallet to cover gas. No additional platform fee from ZakatChain.

=== COIN YANG DITERIMA ===

Semasa (Testnet): tMYRC sahaja
Masa hadapan: Coin lain akan disokong (belum diumumkan)

Currently accepted: tMYRC only
Future: Other coins will be supported (not yet announced)

=== CARA BAYAR ZAKAT DI ZAKATCHAIN ===

1. Kira jumlah zakat anda di ZakatChain/Calculator.com
2. Pastikan wallet anda disambungkan ke BSC Testnet
3. Pastikan anda mempunyai tMYRC (untuk zakat) dan tBNB (untuk gas fee)
4. Hantar tMYRC ke alamat yang ditetapkan di platform ZakatChain
5. Gas fee dalam tBNB akan ditolak secara automatik oleh rangkaian

In English:
1. Calculate your zakat at ZakatChain/Calculator.com
2. Connect your wallet to BSC Testnet
3. Ensure you have tMYRC (for zakat) and tBNB (for gas fee)
4. Send tMYRC to the designated address on ZakatChain platform
5. Gas fee in tBNB is automatically deducted by the network

=== TENTANG MYRC — DARI WHITEPAPER ===

Dibangunkan oleh: BLOX Blockchain Sdn Bhd
Alamat: Suite 701, 7th Floor, Wisma Hangsam Jalan Hang Lekir, 50000 Kuala Lumpur
Ciri-ciri utama MYRC:
- Stabil: Dipeg 1:1 kepada MYR, tiada volatiliti
- Selamat: Kriptografi canggih untuk semua transaksi
- Telus: Audit bulanan rizab MYR
- Pelbagai rantaian: Bermula dengan Ethereum, akan menyokong pelbagai chain
- Boleh digunakan untuk: remitans, perdagangan, pembayaran bertujuan (purpose bound money)

=== DEFINISI ZAKAT PENDAPATAN ===

Zakat Pendapatan timbul daripada konsep zakat al-mal al-mustafad (zakat harta perolehan).
Ia bermaksud mewajibkan zakat ke atas mana-mana harta perolehan dari hasil usaha tanpa
sebarang proses pertukaran (jual-beli), seperti gaji, upah kerja, elaun, hadiah dan lain-lain.

Para fuqaha mewajibkan zakat ke atas pendapatan kerana ia merupakan harta yang berkembang
dan boleh membawa perolehan lumayan, terutamanya bagi mereka yang menyandang jawatan
profesional atau peringkat tinggi dalam sesebuah organisasi.

In English: Zakat Pendapatan (Zakat al-Mal al-Mustafad) is obligatory zakat on income earned
through employment or professional work — salary, wages, allowances, bonuses, gifts and any
income earned without a buying/selling process.

=== ASAS HUKUM ===

1. Al-Quran: Surah Al-Baqarah (2):267 — tentang perbelanjaan dari hasil usaha yang baik
2. Hadith: Riwayat Said bin Abi Burdah — Nabi SAW menekankan sedekah dari hasil pendapatan
3. Fatwa Wilayah Persekutuan (29 April 1999): Zakat wajib ke atas pendapatan penggajian
4. Fatwa Kebangsaan Kali Ke-56 (7 Mei 2003): Kadar 2.5% daripada pendapatan kasar setahun
5. Muzakarah Khas (22 Jun 1997): Zakat pendapatan penggajian adalah wajib
6. Muzakarah Ke-31 (9 Disember 1992): Pendapatan profesional diwajibkan zakat

=== NISAB 2026 (MAIWP / KL / WILAYAH PERSEKUTUAN) ===

Nisab 2026: RM 33,996
Berdasarkan 85 gram emas pada harga RM 399.95 per gram.
Jika jumlah pendapatan layak di bawah RM 33,996 setahun, tiada zakat wajib dibayar.

=== KADAR ZAKAT ===

2.5% daripada pendapatan layak setahun.

=== DUA MOD PENGIRAAN ===

MOD 1 — TANPA TOLAKAN:
1. Jumlahkan semua sumber pendapatan setahun
2. Semak sama ada jumlah >= RM 33,996 (nisab)
3. Zakat Kasar = Jumlah Pendapatan x 2.5%
4. Tolak Caruman Berzakat (jika ada)
5. Zakat Setahun = Zakat Kasar - Caruman Berzakat
6. Zakat Sebulan = Zakat Setahun / 12

MOD 2 — DENGAN TOLAKAN:
Langkah A: Jumlahkan semua pendapatan setahun
Langkah B: Tolak Had Kifayah (perbelanjaan asas)
Langkah C: Tolak Caruman KWSP pekerja (11% daripada gaji kasar)
Langkah D: Pendapatan Layak = A - B - C
Langkah E: Semak sama ada Pendapatan Layak >= RM 33,996
Langkah F: Zakat = Pendapatan Layak x 2.5%
Langkah G: Tolak Caruman Berzakat
Langkah H: Zakat Setahun = F - G
Langkah I: Zakat Sebulan = H / 12

=== SUMBER PENDAPATAN YANG DIKENAKAN ZAKAT ===

1. Hasil Penggajian & Upah:
   Gaji, upah, bonus, tuntutan kerja lebih masa, gratuiti, pampasan, pencen,
   hadiah, anugerah, insentif, ESOS (Skim Pilihan Saham Pekerja)

2. Hasil Kerja Bebas & Profesional:
   Bayaran konsultansi, keuntungan projek kontraktor, komisyen insuran/takaful/unit amanah,
   royalti penulisan, penerbitan, aktiviti seni

3. Hasil al-Mustaghallat:
   Sewaan rumah, bangunan, kenderaan, premis, peralatan,
   hasil pertanian (getah, kelapa sawit), hasil ternakan (susu, telur, madu)

4. Hasil Pemberian atau Sumbangan:
   Hibah, hadiah, saguhati, pencen pasangan, sedekah,
   pampasan, harta pusaka, mahar kahwin

=== PENDAPATAN YANG TIDAK DIKENAKAN ZAKAT ===

- Tuntutan lojing, tuntutan ke luar negara
- Tuntutan keraian, tuntutan perbatuan
- Tuntutan lain-lain yang dikecualikan

=== HAD KIFAYAH KL/WP 2026 ===

Had Kifayah adalah ambang perbelanjaan asas minimum untuk seisi rumah sebelum zakat wajib.
Kadar ditetapkan oleh MAIWP berdasarkan kos sara hidup di KL/Wilayah Persekutuan.

Kadar:
- Diri Sendiri: RM 12,000 setahun (RM 1,000 sebulan) — TETAP
- Isteri: RM 5,000 setiap isteri (maksimum 4 isteri)
- Anak bawah 18 tahun: RM 2,000 setiap anak
- Anak 18 tahun ke atas (belajar IPT): RM 5,000 setiap anak
- Ibu Bapa: jumlah sebenar yang ditanggung (pengguna isi sendiri)
- KWSP/EPF pekerja: 11% daripada gaji kasar sahaja
- Pendidikan Sendiri: jumlah sebenar, maksimum RM 2,000 setahun

=== KWSP / EPF ===

- Hanya caruman KWSP bahagian PEKERJA (11%, bawah 55 tahun) boleh ditolak
- Caruman KWSP majikan TIDAK boleh ditolak
- Tolakan EPF hanya untuk gaji/upah — TIDAK terpakai untuk sewaan, bonus atau pendapatan bebas

=== CARUMAN BERZAKAT ===

Zakat yang ditolak oleh majikan daripada gaji pekerja dan dibayar terus ke MAIWP.
Jumlah ini ditolak daripada zakat akhir supaya pekerja tidak bayar dua kali.

=== PASANGAN YANG BEKERJA ===

- Suami dan isteri mengira zakat masing-masing secara berasingan
- Anak yang sama HANYA boleh dituntut oleh SATU pasangan sahaja
- Anak yang sama TIDAK boleh dituntut oleh kedua-dua suami isteri dalam tahun yang sama

=== ZAKAT FITRAH (KL / WILAYAH PERSEKUTUAN) ===

Zakat Fitrah adalah zakat yang wajib dikeluarkan pada bulan Ramadan.
Pembayaran boleh dilakukan melalui ZakatChain/Calculator.com menggunakan tMYRC.

SYARAT WAJIB ZAKAT FITRAH:
Orang Islam yang merdeka wajib mengeluarkan zakat fitrah untuk diri dan keluarga atau tanggungannya:
1. Individu yang mempunyai lebihan makanan atau hartanya dari keperluan tanggungannya pada malam dan pagi raya
2. Anak yang lahir sebelum matahari jatuh pada akhir Ramadan dan hidup selepas terbenam matahari
3. Memeluk Islam sebelum terbenam matahari pada akhir bulan Ramadan dan berkekalan Islamnya
4. Seseorang yang meninggal dunia selepas terbenam matahari pada akhir Ramadan

KADAR ZAKAT FITRAH KL/WILAYAH PERSEKUTUAN:
Terdapat 3 kadar yang boleh dipilih berdasarkan kemampuan:
- RM 8 seseorang (kadar minimum)
- RM 15 seseorang (kadar sederhana)
- RM 20 seseorang (kadar tinggi, digalakkan bagi yang berkemampuan)

KENAPA KADAR BERBEZA:
- Kadar zakat fitrah ditetapkan oleh Jawatankuasa Fatwa negeri berdasarkan jenis beras yang dimakan majoriti penduduk
- Kadar terikat dengan harga satu gantang beras yang dimakan
- Negeri dengan penduduk yang banyak memakan beras gred tinggi menetapkan kadar lebih tinggi
- Kadar lebih tinggi digalakkan bagi yang berkemampuan, selaras dengan harga beras gred tinggi
- Setiap negeri mempunyai autonomi untuk menetapkan kadar berdasarkan jawatankuasa fatwa tempatan

CARA KIRA ZAKAT FITRAH:
Jumlah = Bilangan orang × Kadar yang dipilih
Contoh: 4 orang × RM 15 = RM 60

In English:
Zakat Fitrah is obligatory zakat paid during Ramadan. Three rates available in KL/WP:
- RM 8 per person (minimum rate)
- RM 15 per person (medium rate)  
- RM 20 per person (higher rate, encouraged for those who can afford it)
Total = Number of persons × Selected rate

=== SOALAN LAZIM ===

S: Adakah bonus dikenakan zakat?
J: Ya. Bonus termasuk dalam Hasil Penggajian dan dikenakan zakat.

S: Saya baru dapat kerja, adakah wajib bayar zakat?
J: Wajib jika pendapatan tahunan mencapai atau melebihi nisab RM 33,996.
   Jika di bawah nisab, tidak wajib tetapi boleh bayar sukarela sebagai infaq.

S: Apa beza Tanpa Tolakan dan Dengan Tolakan?
J: Tanpa Tolakan — zakat dikira ke atas pendapatan kasar penuh.
   Dengan Tolakan — tolak Had Kifayah dan KWSP dahulu, kemudian kira zakat ke atas baki.
   Dengan Tolakan biasanya menghasilkan jumlah zakat lebih rendah.

S: Suami isteri bekerja, boleh dua-dua tolak anak yang sama?
J: Tidak. Hanya satu pasangan sahaja boleh menuntut tolakan untuk anak yang sama.

S: Adakah caruman KWSP majikan boleh ditolak?
J: Tidak. Hanya caruman KWSP bahagian pekerja (11%) yang boleh ditolak.

S: Berapa gas fee?
J: Gas fee bergantung kepada keadaan rangkaian BSC Testnet pada masa pembayaran.
   Ia dikenakan oleh rangkaian, bukan ZakatChain. Anda memerlukan tBNB dalam wallet.

S: Adakah ada caj platform dari ZakatChain?
J: Tidak. ZakatChain tidak mengenakan sebarang caj tambahan. Hanya gas fee rangkaian sahaja.

S: Boleh bayar dengan coin lain selain tMYRC?
J: Buat masa ini hanya tMYRC diterima. Coin lain akan disokong pada masa hadapan.

S: Does bonus count as income for zakat?
A: Yes. Bonus is included under employment income and is subject to zakat.

S: Is there a platform fee from ZakatChain?
A: No. ZakatChain does not charge any platform fee. Only the BSC network gas fee applies.

S: What coin do I use to pay zakat?
A: Currently tMYRC only. Other coins will be supported in the future.

S: What is the gas fee?
A: Gas fee depends on BSC Testnet network conditions at the time of payment. It is charged
   by the network, not ZakatChain. You need tBNB in your wallet to cover gas.

S: Is employer EPF contribution deductible?
A: No. Only the employee EPF contribution (11%) is deductible. Employer contribution is not.

S: Anak saya lahir sebelum raya, adakah wajib bayar zakat fitrah?
J: Ya. Anak yang lahir sebelum terbenam matahari pada akhir Ramadan dan masih hidup selepas terbenam matahari adalah wajib dikeluarkan zakat fitrahnya.

S: Can I choose RM 20 even though minimum is RM 8?
A: Yes. You may choose any of the three rates — RM 8, RM 15, or RM 20. Higher rates are encouraged for those who can afford it.

S: Boleh saya bayar kadar RM 20 walaupun kadar minimum RM 8?
J: Ya. Anda boleh memilih mana-mana kadar — RM 8, RM 15, atau RM 20. Kadar lebih tinggi digalakkan bagi yang berkemampuan. Tiada paksaan untuk membayar pada kadar minimum sahaja.

S: Can I choose RM 20 even though minimum rate is RM 8?
A: Yes. You may choose any rate — RM 8, RM 15, or RM 20. Higher rates are encouraged for those who can afford it. You are not restricted to the minimum rate only.

=== SKOP LUAR — REDIRECT KE zakat2u.com.my ===

Kami tidak merangkumi:
- Zakat Perniagaan, Zakat Emas, Zakat Wang Simpanan, Zakat Saham
- Zakat KWSP (pengeluaran KWSP), Zakat Pertanian, Fidyah
- Zakat Fitrah negeri lain — kami hanya untuk KL/WP
- Pengagihan zakat / kelayakan asnaf
- Pembayaran zakat merentasi negeri
- Zakat negeri lain — kami hanya untuk KL/WP

Hubungi: zakat2u.com.my atau 1-300-88-5757
Kalkulator & pembayaran: ZakatChain/Calculator.com

=== PERINGATAN AKHIR ===

Anda adalah pembaca dokumen. Semua jawapan MESTI datang daripada maklumat yang ditulis di atas sahaja.
Jika maklumat tidak ada di atas, jawab: "Untuk maklumat lanjut, sila layari zakat2u.com.my atau hubungi 1-300-88-5757."
KADAR ZAKAT ADALAH 2.5% — BUKAN 10%. MAIWP — BUKAN MAIS ATAU MANA-MANA BADAN LAIN.
NISAB 2026 ADALAH RM 33,996 — BUKAN MANA-MANA ANGKA LAIN.

FINAL REMINDER:
You are a document reader. All answers MUST come only from the information written above.
If information is not above, say: "For more information, please visit zakat2u.com.my or call 1-300-88-5757."
ZAKAT RATE IS 2.5% — NOT 10%. MAIWP — NOT MAIS OR ANY OTHER BODY.
NISAB 2026 IS RM 33,996 — NOT ANY OTHER FIGURE.
`.trim();

@Injectable()
export class ChatbotService {
  private sessions = new Map<string, Session>();

  async chat(dto: ChatMessageDto): Promise<ChatResponseDto> {
    const sessionId = dto.sessionId ?? randomUUID();
    const session = this.getOrCreateSession(sessionId);
    const isMalay = this.isMalayText(dto.message);

    // Guard 1: Redirect calculation requests
    if (this.isCalculationRequest(dto.message)) {
      const reply = isMalay
        ? FIXED_RESPONSES.calculationMalay
        : FIXED_RESPONSES.calculationEnglish;
      return { sessionId, reply };
    }

    // Guard 1b: Legal basis — model hallucinates Quran verses
    if (this.isLegalBasisRequest(dto.message)) {
      const reply = isMalay
        ? FIXED_RESPONSES.legalBasisMalay
        : FIXED_RESPONSES.legalBasisEnglish;
      return { sessionId, reply };
    }

    // Guard 1c: Out of scope questions
    if (this.isOutOfScopeQuestion(dto.message)) {
      const reply = isMalay
        ? FIXED_RESPONSES.outOfScopeMalay
        : FIXED_RESPONSES.outOfScopeEnglish;
      return { sessionId, reply };
    }

    // Guard 1d: Other coins question
    if (this.isOtherCoinsRequest(dto.message)) {
      const reply = this.isMalayMessage(dto.message)
        ? FIXED_RESPONSES.otherCoinsMalay
        : FIXED_RESPONSES.otherCoinsEnglish;
      return { sessionId, reply };
    }

    // Guard 1e: MYRC/tMYRC info
    if (this.isMyrcInfoRequest(dto.message)) {
      const reply = this.isMalayMessage(dto.message)
        ? FIXED_RESPONSES.myrcInfoMalay
        : FIXED_RESPONSES.myrcInfoEnglish;
      return { sessionId, reply };
    }

    // Add message to session history
    session.messages.push({ role: 'user', content: dto.message });
    session.lastActive = Date.now();

    // Build messages with system prompt
    const languageReminder = this.isMalayMessage(dto.message)
      ? '\n\nPERINGATAN PENTING: Jawab soalan ini dalam Bahasa Malaysia sahaja. Jangan gunakan bahasa Inggeris.'
      : '\n\nIMPORTANT REMINDER: Answer this question in English only. Do not use Malay.';
    const messages: ConversationMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + languageReminder },
      ...session.messages,
    ];
    // Call Ollama
    let reply = this.sanitizeReply(await this.callOllama(messages));

    // Guard 2: Out of scope model responses
    if (this.isOutOfScopeResponse(reply)) {
      reply = isMalay
        ? FIXED_RESPONSES.outOfScopeMalay
        : FIXED_RESPONSES.outOfScopeEnglish;
    }

    // Guard 3: Uncertain model responses
    if (this.isUncertainResponse(reply)) {
      reply = isMalay
        ? FIXED_RESPONSES.uncertainMalay
        : FIXED_RESPONSES.uncertainEnglish;
    }

    // Save reply to session history
    session.messages.push({ role: 'assistant', content: reply });

    this.cleanupSessions();

    return { sessionId, reply };
  }

  // ---------------------------------------------------------------------------
  // Ollama API call 
  // ---------------------------------------------------------------------------
  private async callOllama(messages: ConversationMessage[]): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            repeat_penalty: 1.1,
            num_ctx: 8192,
          },
        }),
      });

      const data = await response.json() as {
        message?: { content?: string };
        error?: string;
      };

      // Handle Ollama error response
      if (data.error) {
        throw new Error(`Ollama error: ${data.error}`);
      }

      // Handle missing message content
      if (!data.message?.content) {
        throw new Error('Ollama returned empty response');
      }

      return data.message.content.trim();
    } catch (err: any) {
      console.error('Ollama unreachable:', err?.message);
      return 'Our AI assistant is temporarily unavailable. Please try again in a moment.';
    }
  }

  // ---------------------------------------------------------------------------
  // Guard 1: Calculation requests
  // ---------------------------------------------------------------------------
  private isCalculationRequest(message: string): boolean {
    const lower = message.toLowerCase();
    if (lower.includes('nisab')) return false;
    if (lower.includes('tmyrc') || lower.includes('myrc')) return false;
    if (lower.includes('zakat fitrah')) return false;
    if (lower.includes('boleh saya bayar kadar')) return false;
    if (lower.includes('can i choose')) return false;
    if (lower.includes('can i pay rate')) return false;
    const hasNumber = /\d/.test(message);
    const keywords = [
      'berapa', 'how much', 'calculate', 'kira', 'hitung',
      'need to pay', 'perlu bayar', 'gaji saya', 'my salary',
      'i earn', 'pendapatan saya', 'rm ', 'ringgit',
      'sebulan', 'setahun', 'per month', 'per year',
    ];
    return hasNumber && keywords.some(k => lower.includes(k));
  }

  // ---------------------------------------------------------------------------
  // Guard 1b: Legal basis questions
  // ---------------------------------------------------------------------------
  private isLegalBasisRequest(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('legal basis') ||
      lower.includes('dalil') ||
      lower.includes('asas hukum') ||
      lower.includes('dasar hukum') ||
      lower.includes('quran') ||
      lower.includes('al-quran') ||
      lower.includes('fatwa') ||
      lower.includes('why is zakat') ||
      lower.includes('mengapa zakat wajib') ||
      lower.includes('hadith') ||
      lower.includes('hukum zakat') ||
      lower.includes('why do muslims')
    );
  }

  // ---------------------------------------------------------------------------
  // Guard 1c: Out of scope questions
  // ---------------------------------------------------------------------------
  private isOutOfScopeQuestion(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('zakat perniagaan') ||
      lower.includes('zakat emas') ||
      lower.includes('zakat saham') ||
      lower.includes('zakat simpanan') ||
      lower.includes('zakat wang simpanan') ||
      lower.includes('zakat kwsp') ||
      lower.includes('zakat pertanian') ||
      lower.includes('fidyah') ||
      lower.includes('business zakat') ||
      lower.includes('gold zakat') ||
      lower.includes('asnaf') ||
      lower.includes('agihan zakat') ||
      lower.includes('distribute zakat')
    );
  }

  // ---------------------------------------------------------------------------
  // Guard 1d: Other coins question
  // ---------------------------------------------------------------------------
  private isOtherCoinsRequest(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('coin lain') ||
      lower.includes('other coin') ||
      lower.includes('selain tmyrc') ||
      lower.includes('other than tmyrc') ||
      lower.includes('besides tmyrc') ||
      lower.includes('cryptocurrency lain') ||
      lower.includes('token lain')
    );
  }

  // ---------------------------------------------------------------------------
  // Guard 1e: MYRC/tMYRC info questions
  // ---------------------------------------------------------------------------
  private isMyrcInfoRequest(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('apa itu myrc') ||
      lower.includes('apa itu tmyrc') ||
      lower.includes('what is myrc') ||
      lower.includes('what is tmyrc') ||
      lower.includes('myrc stablecoin') ||
      lower.includes('pasal myrc') ||
      lower.includes('tentang myrc') ||
      lower.includes('tentang tmyrc') ||
      lower.includes('explain myrc') ||
      lower.includes('explain tmyrc')
    );
  }

  // ---------------------------------------------------------------------------
  // Guard 2: Out of scope model responses
  // ---------------------------------------------------------------------------
  private isOutOfScopeResponse(reply: string): boolean {
    const signals = [
      'tidak dapat membantu',
      'tidak berkhidmat',
      'bukan dalam kawasan',
      'melampaui skop',
      'di luar skop',
      'cannot help',
      'outside my scope',
      'outside our scope',
      'not within',
      'tidak meliputi',
      'tidak menawarkan',
      'tidak membantu',
    ];
    const lower = reply.toLowerCase();
    return signals.some(s => lower.includes(s));
  }

  // ---------------------------------------------------------------------------
  // Guard 3: Uncertain model responses
  // ---------------------------------------------------------------------------
  private isUncertainResponse(reply: string): boolean {
    const signals = [
      'tidak pasti',
      'tidak tahu',
      'tidak dapat mengesahkan',
      'sila rujuk',
      'i am not sure',
      "i'm not sure",
      'we are not sure',
      'not sure',
      'cannot confirm',
      'unable to confirm',
      'please consult',
      'please check with',
      'knowledge cutoff',
      'my knowledge',
      'as of my',
    ];
    const lower = reply.toLowerCase();
    return signals.some(s => lower.includes(s));
  }
  private isMalayMessage(message: string): boolean {
    const lower = message.toLowerCase();
    const malayWords = [
      'apa itu', 'apakah', 'boleh', 'kenapa', 'macam mana',
      'bagaimana', 'adakah', 'mengapa', 'untuk', 'dengan',
      'pasal', 'tentang', 'cerita',
    ];
    return malayWords.some(w => lower.includes(w));
  }
  // ---------------------------------------------------------------------------
  // Post-processor: clean up model reply
  // ---------------------------------------------------------------------------
  private sanitizeReply(reply: string): string {
    return reply
      // Remove unnecessary openers
      .replace(/^Selamat\s+\w+[!,.]?\s*/i, '')
      .replace(/^Kami\s+(sangat\s+)?(gembira|bersyukur|berbesar hati).*?\.\s*/i, '')
      .replace(/^Kami\s+bantu\s+dengan\s+senang\s+hati\.?\s*/i, '')
      .replace(/^Kami\s+(berhajat|ingin|berhasrat).*?\.\s*/i, '')
      .replace(/^Kami dapat menjawab soalan ini!?\s*/i, '')
      .replace(/^Kami boleh menjawab.*?\.\s*/i, '')
      .replace(/^Terima kasih atas soalan (anda|kami)\.?\s*/i, '')
      .replace(/^Thank you for (your question|asking)\.?\s*/i, '')
      .replace(/^(Great|Good) question!?\s*/i, '')
      .replace(/^Sure!?\s*/i, '')
      .replace(/^Pada (masa|tahap) ini,?\s*/i, '')
      .replace(/^Welcome to ZakatChain!?\s*/i, '')
      .replace(/^ke ZakatChain!?\s*/i, '')
      // Remove self-introduction sentences
      .replace(/Kami adalah asisten.*?\.\s*/gi, '')
      .replace(/Kami adalah sistem.*?\.\s*/gi, '')
      .replace(/Kami mengikuti aturan.*?\.\s*/gi, '')
      .replace(/Kami menyesuaikan.*?\.\s*/gi, '')
      .replace(/berikutan aturan MAIWP.*?\.\s*/gi, '')
      // Remove unnecessary closers
      .replace(/Untuk lebihan maklumat.*$/i, '')
      .replace(/Kalkulator dan pembayaran.*$/i, '')
      .replace(/Hubungi:.*$/i, '')
      .replace(/Kalkulator &.*$/i, '')
      .replace(/Jika anda mempunyai soalan lain.*$/i, '')
      .replace(/Kami harap jawapan ini membantu.*$/i, '')
      .replace(/If you have (any )?(more |further )?questions.*$/i, '')
      .replace(/Semoga bermanfaat!?\s*$/i, '')
      .replace(/Semoga berjaya!?\s*$/i, '')
      .replace(/Kami tidak menyediakan maklumat tentang zakat.*$/i, '')
      .replace(/Kami tidak akan menyediakan informasi.*$/i, '')
      .replace(/Untuk soalan lain yang bukan.*?\.\s*/gi, '')
      // Strip fabricated payment steps
      .replace(/\n2\.\s+\*\*.*$/is, '')
      .replace(/\*\*Obtain.*$/is, '')
      .replace(/\*\*Transfer.*$/is, '')
      .replace(/\*\*Connect.*$/is, '')
      .replace(/\*\*Initiate.*$/is, '')
      .replace(/\*\*Verify.*$/is, '')
      .replace(/\*\*Confirm.*$/is, '')
      // Enforce Kami over Saya
      .replace(/\bSaya\b/g, 'Kami')
      .replace(/\bsaya\b/g, 'kami')
      // Enforce We over I
      .replace(/\bI am\b/g, 'We are')
      .replace(/\bI can\b/g, 'We can')
      .replace(/\bI only\b/g, 'We only')
      .replace(/\bI will\b/g, 'We will')
      .replace(/\bI don't\b/g, "We don't")
      .replace(/\bI do not\b/g, 'We do not')
      .replace(/\bI'm\b/g, "We're")
      // Fix Indonesian words
      .replace(/\bAnda\b/g, 'anda')
      .replace(/\bunsure\b/gi, 'tidak pasti')
      .replace(/\bbagian\b/gi, 'bahagian')
      .replace(/\blainnya\b/gi, 'lain')
      .replace(/\bpertanyaan\b/gi, 'soalan')
      .replace(/\bharus\b/gi, 'perlu')
      .replace(/\bpenghasilan\b/gi, 'pendapatan')
      .replace(/\bpotongan\b/gi, 'tolakan')
      .replace(/\bmasing-masing\b/gi, 'setiap')
      .replace(/\bsetelah\b/gi, 'selepas')
      .replace(/\bdimana\b/gi, 'di mana')
      .replace(/\buntuk itu\b/gi, 'oleh itu')
      .replace(/\bpelayanan\b/gi, 'perkhidmatan')
      .replace(/\binformasi\b/gi, 'maklumat')
      // Fix URLs
      .replace(/\bZakat 2U\b/gi, 'zakat2u.com.my')
      .replace(/\bzakat2u\.com(?!\.my)/gi, 'zakat2u.com.my')
      .trim();
  }

  // ---------------------------------------------------------------------------
  // Language detector
  // ---------------------------------------------------------------------------
  private isMalayText(message: string): boolean {
    const lower = message.toLowerCase();

    // tMYRC/MYRC — handled by fixed responses, treat as English
    if (lower.includes('tmyrc') || lower.includes('myrc')) return false;

    // Clear English signals
    const englishSignals = [
      'what is', 'what are', 'how do', 'how to', 'how does',
      'can i', 'should i', 'is it', 'does my', 'do i need',
      'why is', 'when do', 'which is', 'tell me about',
      'explain', 'describe', 'define', 'is there',
      'what network', 'how do i', 'what coin', 'is there any',
    ];
    if (englishSignals.some(w => lower.includes(w))) return false;

    // Check for Malay words
    const malayWords = [
      'saya', 'anda', 'berapa', 'gaji', 'anak', 'isteri',
      'bayar', 'boleh', 'dengan', 'untuk', 'perlu',
      'sebulan', 'setahun', 'pendapatan', 'tolakan', 'kira',
      'adakah', 'apakah', 'bagaimana', 'kenapa', 'bila',
      'apa itu', 'siapa', 'dimana', 'mengapa',
    ];
    return malayWords.some(w => lower.includes(w));
  }

  // ---------------------------------------------------------------------------
  // Session management
  // ---------------------------------------------------------------------------
  private getOrCreateSession(sessionId: string): Session {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [],
        lastActive: Date.now(),
      });
    }
    return this.sessions.get(sessionId)!;
  }

  private cleanupSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActive > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}