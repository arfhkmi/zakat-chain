import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ZakatModule = buildModule("ZakatChain", (m) => {
  const paymentToken = m.getParameter("_paymentTokenAddress", "0x6270f082dEa012a20A101bEf7117F651f6B91cae");
  const collector = m.getParameter("_collectorAddress", "0x053009996949Cc9fc62899b3a00ce80F58a4c7cB");

  const rate = m.getParameter("rate", 250n);
  const threshold = m.getParameter("threshold", 33996000000000000000000n);
  const selfDeduction = m.getParameter("selfDeduction", 12000000000000000000000n);
  const wifeDeduction = m.getParameter("wifeDeduction", 5000000000000000000000n);
  const childMinorDeduction = m.getParameter("childMinorDeduction", 2000000000000000000000n);
  const childStudyDeduction = m.getParameter("childStudyDeduction", 5000000000000000000000n);
  const studyMaxDeduction = m.getParameter("studyMaxDeduction", 2000000000000000000000n);

  const localRate = m.getParameter("localRate", 8000000000000000000n);
  const importRate = m.getParameter("importRate", 15000000000000000000n);
  const basmathiRate = m.getParameter("basmathiRate", 25000000000000000000n);

  const zakatPayment = m.contract("ZakatChain", [
    paymentToken,
    collector,
    {
      rate,
      threshold,
      selfDeduction,
      wifeDeduction,
      childMinorDeduction,
      childStudyDeduction,
      studyMaxDeduction
    },
    {
      localRate,
      importRate,
      basmathiRate
    }
  ]);

  return { zakatPayment };
});

export default ZakatModule;