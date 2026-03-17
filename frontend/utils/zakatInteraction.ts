import { JsonRpcProvider, Contract, formatUnits } from 'ethers'
import ZAKAT_ABI from './abi/zakatAbi.json'

const RPC_URL = import.meta.env.VITE_BNB_RPC_NODE || ''
const CONTRACT_ADDRESS = import.meta.env.VITE_ZAKAT_CONTRACT_ADDRESS || ''

const TOKEN_DECIMALS = 18

function getReadContract() {
  const provider = new JsonRpcProvider(RPC_URL)
  return new Contract(CONTRACT_ADDRESS, ZAKAT_ABI, provider)
}

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
