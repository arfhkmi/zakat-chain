import { JsonRpcProvider, FallbackProvider, BrowserProvider, Contract, formatUnits, parseUnits, MaxUint256 } from 'ethers'
import type { Signer } from 'ethers'
import ZAKAT_ABI from './abi/zakatAbi.json'
import TOKEN_ABI from './abi/tokenAbi.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_ZAKAT_CONTRACT_ADDRESS || ''
const TOKEN_DECIMALS = 18

// ── Provider ──────────────────────────────────────────────────────────────────

function getFallbackProvider() {
  const urls: string[] = [
    import.meta.env.VITE_BNB_RPC_NODE_1,
    import.meta.env.VITE_BNB_RPC_NODE_2,
    import.meta.env.VITE_BNB_RPC_NODE_3,
  ].filter(Boolean)
  return new FallbackProvider(urls.map(url => new JsonRpcProvider(url)))
}

function getReadContract() {
  return new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, getFallbackProvider()) as any
}

export async function getSigner(rawWalletProvider: any): Promise<Signer> {
  const p = rawWalletProvider ?? (window as any).ethereum
  if (!p) throw new Error('Please connect your wallet')
  return new BrowserProvider(p as any).getSigner()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FitrahRate {
  localRate: number   // RM equivalent of localRate
  importRate: number  // RM equivalent of importRate
  basmathiRate: number // RM equivalent of basmathiRate
}

export interface IncomeInfo {
  rate: number              // zakat rate in basis points (e.g. 250 = 2.5%)
  threshold: number         // nisab threshold in RM
  selfDeduction: number     // per person self deduction in RM
  wifeDeduction: number     // per wife deduction in RM
  childMinorDeduction: number    // per minor child deduction in RM
  childStudyDeduction: number    // per studying child deduction in RM
  studyMaxDeduction: number      // max self study deduction in RM
}

export interface AdminContractData {
  owner: string
  collector: string
  paymentToken: string
  fitrahRate: { localRate: bigint; importRate: bigint; basmathiRate: bigint }
  fitrahSummary: { count: bigint; balance: bigint; total: bigint }
  incomeInfo: {
    rate: bigint
    threshold: bigint
    selfDeduction: bigint
    wifeDeduction: bigint
    childMinorDeduction: bigint
    childStudyDeduction: bigint
    studyMaxDeduction: bigint
  }
  incomeSummary: { count: bigint; balance: bigint; total: bigint }
}

export interface TokenInfo {
  symbol: string
  decimals: number
}

// ── Public read ───────────────────────────────────────────────────────────────

export async function getFitrahRate(): Promise<FitrahRate> {
  const contract = getReadContract()
  const result = await contract.fitrahRate()
  return {
    localRate: Number(formatUnits(result.localRate, TOKEN_DECIMALS)),
    importRate: Number(formatUnits(result.importRate, TOKEN_DECIMALS)),
    basmathiRate: Number(formatUnits(result.basmathiRate, TOKEN_DECIMALS)),
  }
}

export async function getIncomeInfo(): Promise<IncomeInfo> {
  const contract = getReadContract()
  const result = await contract.incomeInfo()
  return {
    rate: Number(result.rate),
    threshold: Number(formatUnits(result.threshold, TOKEN_DECIMALS)),
    selfDeduction: Number(formatUnits(result.selfDeduction, TOKEN_DECIMALS)),
    wifeDeduction: Number(formatUnits(result.wifeDeduction, TOKEN_DECIMALS)),
    childMinorDeduction: Number(formatUnits(result.childMinorDeduction, TOKEN_DECIMALS)),
    childStudyDeduction: Number(formatUnits(result.childStudyDeduction, TOKEN_DECIMALS)),
    studyMaxDeduction: Number(formatUnits(result.studyMaxDeduction, TOKEN_DECIMALS)),
  }
}

// ── Admin read ────────────────────────────────────────────────────────────────

export async function getAdminContractData(): Promise<AdminContractData> {
  const contract = getReadContract()
  const [owner, collector, paymentToken, fRate, fSummary, iInfo, iSummary] = await Promise.all([
    contract.owner(),
    contract.collector(),
    contract.paymentToken(),
    contract.fitrahRate(),
    contract.fitrahSummary(),
    contract.incomeInfo(),
    contract.incomeSummary(),
  ])
  return {
    owner,
    collector,
    paymentToken,
    fitrahRate: { localRate: fRate.localRate, importRate: fRate.importRate, basmathiRate: fRate.basmathiRate },
    fitrahSummary: { count: fSummary.count, balance: fSummary.balance, total: fSummary.total },
    incomeInfo: {
      rate: iInfo.rate,
      threshold: iInfo.threshold,
      selfDeduction: iInfo.selfDeduction,
      wifeDeduction: iInfo.wifeDeduction,
      childMinorDeduction: iInfo.childMinorDeduction,
      childStudyDeduction: iInfo.childStudyDeduction,
      studyMaxDeduction: iInfo.studyMaxDeduction,
    },
    incomeSummary: { count: iSummary.count, balance: iSummary.balance, total: iSummary.total },
  }
}

export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  const provider = getFallbackProvider()
  const tokenContract = new Contract(tokenAddress, TOKEN_ABI, provider) as any
  const [symbol, decimals] = await Promise.all([tokenContract.symbol(), tokenContract.decimals()])
  return { symbol, decimals: Number(decimals) }
}

// ── Admin write ───────────────────────────────────────────────────────────────

export async function adminChangeCollector(signer: Signer, collectorAddress: string) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  return contract.changeCollector(collectorAddress)
}

export async function adminCollectFunds(signer: Signer, isFitrah: boolean) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  return contract.collect(isFitrah)
}

export async function adminUpdateFitrahRates(
  signer: Signer,
  rates: { localRate: string; importRate: string; basmathiRate: string },
  decimals: number
) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  return contract.updateFitrahRates({
    localRate: parseUnits(rates.localRate, decimals),
    importRate: parseUnits(rates.importRate, decimals),
    basmathiRate: parseUnits(rates.basmathiRate, decimals),
  })
}

export async function adminUpdateIncomeInfo(
  signer: Signer,
  info: {
    rate: string
    threshold: string
    selfDeduction: string
    wifeDeduction: string
    childMinorDeduction: string
    childStudyDeduction: string
    studyMaxDeduction: string
  },
  decimals: number
) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  return contract.updateIncomeInfo({
    rate: BigInt(Math.round(Number(info.rate) * 100)),
    threshold: parseUnits(info.threshold, decimals),
    selfDeduction: parseUnits(info.selfDeduction, decimals),
    wifeDeduction: parseUnits(info.wifeDeduction, decimals),
    childMinorDeduction: parseUnits(info.childMinorDeduction, decimals),
    childStudyDeduction: parseUnits(info.childStudyDeduction, decimals),
    studyMaxDeduction: parseUnits(info.studyMaxDeduction, decimals),
  })
}

// ── User payment ──────────────────────────────────────────────────────────────

export interface IncomePayParams {
  isWithDeduction: boolean
  payType: number           // IncomePayType enum: 0=STANDARD, 1=CUSTOM
  annualIncome: string      // RM as decimal string
  contribution: string      // pre-paid zakat RM as decimal string
  customAmount: string      // custom amount RM as decimal string (use '0' for standard)
  deductions: {
    wifeCount: number
    childMinorCount: number
    childStudyCount: number
    parentDeduction: string  // RM as decimal string
    epfDeduction: string     // RM as decimal string
    studyDeduction: string   // RM as decimal string
  }
}

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

async function ensureAllowance(signer: Signer, tokenAddress: string, requiredAmount: number) {
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer) as any
  const signerAddress = await signer.getAddress()
  const requiredRaw = parseUnits(requiredAmount.toFixed(6), TOKEN_DECIMALS)
  const allowance: bigint = await tokenContract.allowance(signerAddress, CONTRACT_ADDRESS)
  if (allowance < requiredRaw) {
    const tx = await tokenContract.approve(CONTRACT_ADDRESS, MaxUint256)
    await tx.wait()
  }
}

export async function payFitrahZakat(
  signer: Signer,
  rateType: number,
  count: number,
  payAmount: number,
) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  const tokenAddress: string = await contract.paymentToken()
  await ensureAllowance(signer, tokenAddress, payAmount)
  return contract.payFitrah(rateType, count)
}

export async function payIncomeZakat(signer: Signer, params: IncomePayParams, payAmount: number) {
  const contract = new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, signer) as any
  const tokenAddress: string = await contract.paymentToken()
  await ensureAllowance(signer, tokenAddress, payAmount)
  return contract.payIncome(
    params.isWithDeduction,
    params.payType,
    parseUnits(params.annualIncome, TOKEN_DECIMALS),
    parseUnits(params.contribution, TOKEN_DECIMALS),
    parseUnits(params.customAmount, TOKEN_DECIMALS),
    {
      wifeCount: params.deductions.wifeCount,
      childMinorCount: params.deductions.childMinorCount,
      childStudyCount: params.deductions.childStudyCount,
      parentDeduction: parseUnits(params.deductions.parentDeduction, TOKEN_DECIMALS),
      epfDeduction: parseUnits(params.deductions.epfDeduction, TOKEN_DECIMALS),
      studyDeduction: parseUnits(params.deductions.studyDeduction, TOKEN_DECIMALS),
    },
  )
}
