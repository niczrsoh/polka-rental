// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PolkaRental is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum AgreementStatus {
        PENDING,
        ACTIVE,
        DISPUTED,
        ENDED,
        RESOLVED
    }

    struct Agreement {
        address landlord;
        address tenant;
        uint256 monthlyRent;
        uint256 depositAmount;
        uint256 startTimestamp;
        uint256 durationMonths;
        uint256 lastRentPaidAt;
        uint256 rentPaidCount;
        AgreementStatus status;
        bool depositLocked;
        address disputeRaisedBy;
        string disputeReason;
        string roomTitle;
        string roomLocation;
    }

    // ─────────────────────────────────────────────
    //  STATE VARIABLES — all declared together here
    // ─────────────────────────────────────────────

    IERC20 public immutable stablecoin;
    address public arbitrator;
    address public platformWallet;

    uint256 public agreementCount;
    uint256 public platformFeesCollected;

    uint256 public constant PLATFORM_FEE_BPS = 100;
    uint256 public constant GRACE_PERIOD = 3 days;
    uint256 public constant MIN_DURATION_MONTHS = 1;
    uint256 public constant MAX_DURATION_MONTHS = 24;

    mapping(uint256 => Agreement) public agreements;
    mapping(address => uint256[]) public landlordAgreements;
    mapping(address => uint256[]) public tenantAgreements;
    mapping(uint256 => mapping(address => bool)) public endTenancyConsent;

    event ListingCreated(
        uint256 indexed agreementId,
        address indexed landlord,
        string roomTitle,
        uint256 monthlyRent,
        uint256 depositAmount,
        uint256 durationMonths
    );
    event TenantAccepted(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 depositAmount,
        uint256 startTimestamp
    );
    event RentPaid(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount,
        uint256 monthNumber,
        uint256 timestamp
    );
    event DepositReturned(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount
    );
    event DisputeRaised(
        uint256 indexed agreementId,
        address indexed raisedBy,
        string reason
    );
    event DisputeResolved(
        uint256 indexed agreementId,
        uint256 amountToLandlord,
        uint256 amountToTenant
    );
    event TenancyEnded(uint256 indexed agreementId, uint256 timestamp);
    event EndTenancyRequested(
        uint256 indexed agreementId,
        address indexed requestedBy
    );

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Polka: Not arbitrator");
        _;
    }

    modifier exists(uint256 _id) {
        require(
            _id > 0 && _id <= agreementCount,
            "Polka: Agreement not found"
        );
        _;
    }

    modifier onlyParties(uint256 _id) {
        require(
            msg.sender == agreements[_id].landlord ||
                msg.sender == agreements[_id].tenant,
            "Polka: Not a party"
        );
        _;
    }

    modifier onlyActive(uint256 _id) {
        require(
            agreements[_id].status == AgreementStatus.ACTIVE,
            "Polka: Not active"
        );
        _;
    }


    constructor(address _stablecoin, address _arbitrator, address _platform) {
        require(_stablecoin != address(0), "Polka: Zero stablecoin address");
        require(_arbitrator != address(0), "Polka: Zero arbitrator address");
        require(_platform != address(0), "Polka: Zero platform address");

        stablecoin = IERC20(_stablecoin);
        arbitrator = _arbitrator;
        platformWallet = _platform;
    }


    function createListing(
        string calldata _roomTitle,
        string calldata _roomLocation,
        uint256 _monthlyRent,
        uint256 _depositAmount,
        uint256 _durationMonths
    ) external returns (uint256 agreementId) {
        require(bytes(_roomTitle).length > 0, "Polka: Empty title");
        require(bytes(_roomLocation).length > 0, "Polka: Empty location");
        require(_monthlyRent > 0, "Polka: Rent must be > 0");
        require(_depositAmount > 0, "Polka: Deposit must be > 0");
        require(
            _durationMonths >= MIN_DURATION_MONTHS &&
                _durationMonths <= MAX_DURATION_MONTHS,
            "Polka: Duration must be 1-24 months"
        );

        agreementCount++;
        agreementId = agreementCount;

        Agreement storage a = agreements[agreementId];
        a.landlord = msg.sender;
        a.monthlyRent = _monthlyRent;
        a.depositAmount = _depositAmount;
        a.durationMonths = _durationMonths;
        a.status = AgreementStatus.PENDING;
        a.roomTitle = _roomTitle;
        a.roomLocation = _roomLocation;

        landlordAgreements[msg.sender].push(agreementId);

        emit ListingCreated(
            agreementId,
            msg.sender,
            _roomTitle,
            _monthlyRent,
            _depositAmount,
            _durationMonths
        );
    }

    function acceptListing(uint256 _agreementId) external exists(_agreementId) {
        Agreement storage a = agreements[_agreementId];

        require(a.status == AgreementStatus.PENDING, "Polka: Not available");
        require(
            msg.sender != a.landlord,
            "Polka: Landlord cannot be tenant"
        );
        require(a.tenant == address(0), "Polka: Already has tenant");

        uint256 allowed = stablecoin.allowance(msg.sender, address(this));
        require(
            allowed >= a.depositAmount,
            "Polka: Approve deposit amount first"
        );

        stablecoin.safeTransferFrom(msg.sender, address(this), a.depositAmount);

        a.tenant = msg.sender;
        a.startTimestamp = block.timestamp;
        a.lastRentPaidAt = block.timestamp;
        a.depositLocked = true;
        a.status = AgreementStatus.ACTIVE;

        tenantAgreements[msg.sender].push(_agreementId);

        emit TenantAccepted(
            _agreementId,
            msg.sender,
            a.depositAmount,
            block.timestamp
        );
    }

    function payRent(
        uint256 _agreementId,
        uint256 _months
    ) external nonReentrant exists(_agreementId) onlyActive(_agreementId) {
        Agreement storage a = agreements[_agreementId];

        require(msg.sender == a.tenant, "Polka: Only tenant pays");
        require(_months > 0, "Polka: Must pay at least 1 month");
        require(
            a.rentPaidCount + _months <= a.durationMonths,
            "Polka: Exceeds total duration"
        );

        uint256 totalRent = a.monthlyRent * _months;
        uint256 fee = (totalRent * PLATFORM_FEE_BPS) / 10000;
        uint256 landlordShare = totalRent - fee;

        stablecoin.safeTransferFrom(msg.sender, address(this), totalRent);

        stablecoin.safeTransfer(a.landlord, landlordShare);
        stablecoin.safeTransfer(platformWallet, fee);
        platformFeesCollected += fee;

        a.lastRentPaidAt = block.timestamp;
        a.rentPaidCount += _months;

        emit RentPaid(
            _agreementId,
            msg.sender,
            totalRent,
            a.rentPaidCount,
            block.timestamp
        );

        if (a.rentPaidCount == a.durationMonths) {
            _endTenancy(_agreementId);
        }
    }

    function requestEndTenancy(
        uint256 _agreementId
    )
        external
        exists(_agreementId)
        onlyActive(_agreementId)
        onlyParties(_agreementId)
    {
        endTenancyConsent[_agreementId][msg.sender] = true;
        emit EndTenancyRequested(_agreementId, msg.sender);

        Agreement storage a = agreements[_agreementId];
        if (
            endTenancyConsent[_agreementId][a.landlord] &&
            endTenancyConsent[_agreementId][a.tenant]
        ) {
            _endTenancy(_agreementId);
        }
    }

    function raiseDispute(
        uint256 _agreementId,
        string calldata _reason
    )
        external
        exists(_agreementId)
        onlyActive(_agreementId)
        onlyParties(_agreementId)
    {
        require(bytes(_reason).length > 0, "Polka: Reason required");

        Agreement storage a = agreements[_agreementId];
        a.status = AgreementStatus.DISPUTED;
        a.disputeRaisedBy = msg.sender;
        a.disputeReason = _reason;

        emit DisputeRaised(_agreementId, msg.sender, _reason);
    }

    function resolveDispute(
        uint256 _agreementId,
        uint256 _landlordShare,
        uint256 _tenantShare
    ) external nonReentrant onlyArbitrator exists(_agreementId) {
        Agreement storage a = agreements[_agreementId];

        require(a.status == AgreementStatus.DISPUTED, "Polka: Not disputed");
        require(
            _landlordShare + _tenantShare == a.depositAmount,
            "Polka: Shares must equal deposit"
        );

        a.status = AgreementStatus.RESOLVED;

        if (_landlordShare > 0)
            stablecoin.safeTransfer(a.landlord, _landlordShare);
        if (_tenantShare > 0) stablecoin.safeTransfer(a.tenant, _tenantShare);

        emit DisputeResolved(_agreementId, _landlordShare, _tenantShare);
    }

    function _endTenancy(uint256 _agreementId) internal {
        Agreement storage a = agreements[_agreementId];
        a.status = AgreementStatus.ENDED;

        if (a.depositLocked && a.depositAmount > 0) {
            stablecoin.safeTransfer(a.tenant, a.depositAmount);
            emit DepositReturned(_agreementId, a.tenant, a.depositAmount);
        }

        emit TenancyEnded(_agreementId, block.timestamp);
    }

    function getAgreement(
        uint256 _id
    ) external view exists(_id) returns (Agreement memory) {
        return agreements[_id];
    }

    function getLandlordAgreements(
        address _landlord
    ) external view returns (uint256[] memory) {
        return landlordAgreements[_landlord];
    }

    function getTenantAgreements(
        address _tenant
    ) external view returns (uint256[] memory) {
        return tenantAgreements[_tenant];
    }

    function isRentDue(uint256 _id) external view exists(_id) returns (bool) {
        Agreement storage a = agreements[_id];
        if (a.status != AgreementStatus.ACTIVE) return false;
        if (a.rentPaidCount >= a.durationMonths) return false;

        // Due if current time is within 5 days of next scheduled payment
        uint256 nextDueTime = a.startTimestamp + (a.rentPaidCount * 30 days);
        if (block.timestamp + 5 days >= nextDueTime) return true;
        return false;
    }

    function isRentOverdue(
        uint256 _id
    ) external view exists(_id) returns (bool) {
        Agreement storage a = agreements[_id];
        if (a.status != AgreementStatus.ACTIVE) return false;
        if (a.rentPaidCount >= a.durationMonths) return false;

        uint256 nextDueTime = a.startTimestamp + (a.rentPaidCount * 30 days);
        return block.timestamp > nextDueTime + GRACE_PERIOD;
    }

    function monthsRemaining(
        uint256 _id
    ) external view exists(_id) returns (uint256) {
        Agreement storage a = agreements[_id];
        if (a.rentPaidCount >= a.durationMonths) return 0;
        return a.durationMonths - a.rentPaidCount;
    }

    function getPendingListings() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= agreementCount; i++) {
            if (agreements[i].status == AgreementStatus.PENDING) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= agreementCount; i++) {
            if (agreements[i].status == AgreementStatus.PENDING) {
                result[idx++] = i;
            }
        }
        return result;
    }

    // ─────────────────────────────────────────────
    //  ADMIN & HACKATHON TESTING FEATURES
    // ─────────────────────────────────────────────

    // ! WARNING: FOR HACKATHON DEMO ONLY — REMOVE BEFORE MAINNET
    // Simulates time passing by artificially backdating the startTimestamp and lastRentPaidAt
    function demoFastForwardTime(
        uint256 _agreementId,
        uint256 _days
    ) external exists(_agreementId) {
        Agreement storage a = agreements[_agreementId];

        // Push the timestamps into the past to simulate the future
        a.startTimestamp -= _days * 1 days;
        a.lastRentPaidAt -= _days * 1 days;
    }

    function transferArbitrator(address _new) external onlyArbitrator {
        require(_new != address(0), "Polka: Zero address");
        arbitrator = _new;
    }
}
