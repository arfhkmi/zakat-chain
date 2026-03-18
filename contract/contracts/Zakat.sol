// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZakatChain is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  IERC20 public paymentToken;

  address public collector;

  struct IncomeInfo {
    uint128 rate;
    uint128 threshold;
    uint256 selfDeduction;
    uint256 wifeDeduction;
    uint256 childMinorDeduction;
    uint256 childStudyDeduction;
    uint256 studyMaxDeduction;
  }
  IncomeInfo public incomeInfo;

  struct FitrahRate {
    uint80 localRate;
    uint80 importRate;
    uint80 basmathiRate;
  }
  FitrahRate public fitrahRate;

  struct ZakatSummary {
    uint256 count;
    uint256 balance;
    uint256 total;
  }
  ZakatSummary public fitrahSummary;
  ZakatSummary public incomeSummary;

  struct DeductionInput {
    uint8 wifeCount;
    uint8 childMinorCount;
    uint8 childStudyCount;
    uint256 parentDeduction;
    uint256 epfDeduction;
    uint256 studyDeduction;
  }

  enum FitrahRateType { Local, Import, Basmathi }
  enum IncomePayType  { Annual, Monthly, Custom }

  event FitrahPaid(address indexed payer, FitrahRateType rateType, uint80 rate, uint256 total);
  event IncomePaid(address indexed payer, uint256 total);
  event ZakatWithdrawn(address indexed collector, bool isFitrah, uint256 amount);
  event CollectorChanged(address indexed oldCollector, address indexed newCollector);

  constructor (
    address _paymentTokenAddress,
    address _collectorAddress,
    IncomeInfo memory _incomeInfo,
    FitrahRate memory _fitrahRate
  ) Ownable(msg.sender) {
    paymentToken = IERC20(_paymentTokenAddress);
    collector = _collectorAddress;

    incomeInfo = _incomeInfo;

    fitrahRate = _fitrahRate;
  }

  function payFitrah(FitrahRateType rateType, uint16 count) external nonReentrant {
    require(count > 0 && count <= 1000, "Invalid count");

    uint80 effectiveRate = fitrahRate.localRate;

    if(rateType == FitrahRateType.Import) {
      effectiveRate = fitrahRate.importRate;
    } else if (rateType == FitrahRateType.Basmathi) {
      effectiveRate = fitrahRate.basmathiRate;
    }

    uint256 paymentAmount = uint256(count) * uint256(effectiveRate);

    paymentToken.safeTransferFrom(msg.sender, address(this), paymentAmount);
    fitrahSummary.total += paymentAmount;
    fitrahSummary.balance += paymentAmount;
    fitrahSummary.count += uint256(count);

    emit FitrahPaid(msg.sender, rateType, effectiveRate, paymentAmount);
  }

  function payIncome(
    bool isWithDeduction,
    IncomePayType payType,
    uint256 annualIncome,
    uint256 contribution,
    uint256 customAmount,
    DeductionInput memory deductions
  ) external nonReentrant {
    require(contribution <= annualIncome, "Invalid input"); 
    uint256 paymentAmount;

    if (payType != IncomePayType.Custom) {
      uint256 annualAmount;

      if (isWithDeduction) {
        require(
          deductions.wifeCount <= 4 &&
          deductions.childMinorCount <= 20 &&
          deductions.childStudyCount <= 20 &&
          deductions.studyDeduction <= incomeInfo.studyMaxDeduction &&
          deductions.epfDeduction <= annualIncome &&
          deductions.parentDeduction <= annualIncome,
          "Invalid input"
        );

        uint256 totalDeduction = incomeInfo.selfDeduction +
          (incomeInfo.wifeDeduction * deductions.wifeCount) +
          (incomeInfo.childMinorDeduction * deductions.childMinorCount) +
          (incomeInfo.childStudyDeduction * deductions.childStudyCount) +
          deductions.parentDeduction +
          deductions.epfDeduction +
          deductions.studyDeduction;

        require(annualIncome >= totalDeduction, "Deductions exceed income");

        uint256 eligible = annualIncome - totalDeduction;

        if (eligible >= incomeInfo.threshold) {
          uint256 rawAmount = eligible * incomeInfo.rate / 10000;
          annualAmount = rawAmount > contribution ? rawAmount - contribution : 0;
        }
      } else {
        if(annualIncome >= incomeInfo.threshold) {
          uint256 rawAmount = annualIncome * incomeInfo.rate / 10000;
          annualAmount = rawAmount > contribution ? rawAmount - contribution : 0;
        }
      }

      if(payType == IncomePayType.Annual) {
        paymentAmount = annualAmount;
      } else {
        paymentAmount = annualAmount / 12;
      }
    } else {
      require(customAmount <= annualIncome, "Invalid input");
      paymentAmount = customAmount;
    }
    require(paymentAmount > 0, "Nothing to pay");

    paymentToken.safeTransferFrom(msg.sender, address(this), paymentAmount);
    incomeSummary.total += paymentAmount;
    incomeSummary.balance += paymentAmount;
    incomeSummary.count ++;

    emit IncomePaid(msg.sender, paymentAmount);
  }

  function updateIncomeInfo(IncomeInfo memory _incomeInfo) external onlyOwner {
    require(
      _incomeInfo.rate <= 10000 &&
      _incomeInfo.threshold > 0 &&
      _incomeInfo.selfDeduction > 0,
      "Invalid self deduction"
    );

    incomeInfo = _incomeInfo;
  }

  function updateFitrahRates(FitrahRate memory _fitrahRate) external onlyOwner {
    require(
      _fitrahRate.localRate > 0 &&
      _fitrahRate.importRate > 0 &&
      _fitrahRate.basmathiRate > 0,
      "Invalid rates"
    );

    fitrahRate = _fitrahRate;
  }

  function collect(bool isFitrah) external nonReentrant {
    require(msg.sender == collector || msg.sender == owner(), "Unauthorized");

    ZakatSummary storage summary = isFitrah ? fitrahSummary : incomeSummary;
    uint256 collectedAmount = summary.balance;

    require(collectedAmount > 0, "Nothing to collect");

    summary.balance = 0;
    paymentToken.safeTransfer(collector, collectedAmount);

    emit ZakatWithdrawn(collector, isFitrah, collectedAmount);
  }

  function changeCollector(address _newCollector) external onlyOwner {
    require(_newCollector != address(0), "Zero address");

    address old = collector;
    collector = _newCollector;

    emit CollectorChanged(old, _newCollector);
  }
}