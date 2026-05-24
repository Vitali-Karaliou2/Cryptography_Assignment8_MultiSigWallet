// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MultisigWallet {
    // ============ STATE VARIABLES ============
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredConfirmations;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) isConfirmed;
    }
    
    Transaction[] public transactions;
    
    // ============ EVENTS ============
    
    event TransactionSubmitted(uint256 indexed txId, address indexed from, address to, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);
    event ConfirmationRevoked(uint256 indexed txId, address indexed owner);
    event OwnerAdded(address indexed newOwner);
    event OwnerRemoved(address indexed removedOwner);
    event RequiredConfirmationsChanged(uint256 oldValue, uint256 newValue);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Multisig: not an owner");
        _;
    }
    
    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Multisig: transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Multisig: transaction already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _txId) {
        require(!transactions[_txId].isConfirmed[msg.sender], "Multisig: transaction already confirmed by this owner");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Multisig: at least one owner required");
        require(_required > 0 && _required <= _owners.length, "Multisig: invalid confirmation threshold");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Multisig: invalid owner address");
            require(!isOwner[owner], "Multisig: duplicate owner");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        requiredConfirmations = _required;
    }
    
    // ============ TRANSACTION FUNCTIONS ============
    
    function submitTransaction(address _to, uint256 _value, bytes calldata _data) 
        external 
        onlyOwner 
    {
        uint256 txId = transactions.length;
        transactions.push();
        
        Transaction storage newTx = transactions[txId];
        newTx.to = _to;
        newTx.value = _value;
        newTx.data = _data;
        
        emit TransactionSubmitted(txId, msg.sender, _to, _value);
        
        // Auto-confirm by submitter
        confirmTransaction(txId);
    }
    
    function confirmTransaction(uint256 _txId) 
        public 
        onlyOwner 
        txExists(_txId) 
        notExecuted(_txId) 
        notConfirmed(_txId) 
    {
        Transaction storage tx = transactions[_txId];
        tx.isConfirmed[msg.sender] = true;
        tx.confirmations++;
        
        emit TransactionConfirmed(_txId, msg.sender);
        
        // Auto-execute if threshold reached
        if (tx.confirmations >= requiredConfirmations) {
            _executeTransaction(_txId);
        }
    }
    
    function _executeTransaction(uint256 _txId) 
        private 
        txExists(_txId) 
        notExecuted(_txId) 
    {
        Transaction storage tx = transactions[_txId];
        require(tx.confirmations >= requiredConfirmations, "Multisig: not enough confirmations");
        
        tx.executed = true;
        
        (bool success, ) = tx.to.call{value: tx.value}(tx.data);
        require(success, "Multisig: transaction execution failed");
        
        emit TransactionExecuted(_txId, msg.sender);
    }
    
    function executeTransaction(uint256 _txId) 
        external 
        txExists(_txId) 
        notExecuted(_txId) 
    {
        Transaction storage tx = transactions[_txId];
        require(tx.confirmations >= requiredConfirmations, "Multisig: not enough confirmations");
        
        _executeTransaction(_txId);
    }
    
    function revokeConfirmation(uint256 _txId) 
        external 
        onlyOwner 
        txExists(_txId) 
        notExecuted(_txId) 
    {
        Transaction storage tx = transactions[_txId];
        require(tx.isConfirmed[msg.sender], "Multisig: transaction not confirmed by this owner");
        
        tx.isConfirmed[msg.sender] = false;
        tx.confirmations--;
        
        emit ConfirmationRevoked(_txId, msg.sender);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getOwners() external view returns (address[] memory) {
        return owners;
    }
    
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
    
    function getTransaction(uint256 _txId) 
        external 
        view 
        txExists(_txId) 
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations
        ) 
    {
        Transaction storage tx = transactions[_txId];
        return (
            tx.to,
            tx.value,
            tx.data,
            tx.executed,
            tx.confirmations
        );
    }
    
    function getConfirmationCount(uint256 _txId) 
        external 
        view 
        txExists(_txId) 
        returns (uint256) 
    {
        return transactions[_txId].confirmations;
    }
    
    function isConfirmed(uint256 _txId, address _owner) 
        external 
        view 
        txExists(_txId) 
        returns (bool) 
    {
        return transactions[_txId].isConfirmed[_owner];
    }
    
    // ============ OWNER MANAGEMENT (OPTIONAL) ============
    
    function addOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Multisig: invalid owner address");
        require(!isOwner[_newOwner], "Multisig: already an owner");
        
        isOwner[_newOwner] = true;
        owners.push(_newOwner);
        
        emit OwnerAdded(_newOwner);
    }
    
    function removeOwner(address _ownerToRemove) external onlyOwner {
        require(isOwner[_ownerToRemove], "Multisig: not an owner");
        require(owners.length > 1, "Multisig: cannot remove last owner");
        
        isOwner[_ownerToRemove] = false;
        
        // Remove from array
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        
        // Adjust threshold if necessary
        if (requiredConfirmations > owners.length) {
            uint256 oldValue = requiredConfirmations;
            requiredConfirmations = owners.length;
            emit RequiredConfirmationsChanged(oldValue, requiredConfirmations);
        }
        
        emit OwnerRemoved(_ownerToRemove);
    }
    
    function changeRequiredConfirmations(uint256 _newRequired) external onlyOwner {
        require(_newRequired > 0 && _newRequired <= owners.length, "Multisig: invalid threshold");
        uint256 oldValue = requiredConfirmations;
        requiredConfirmations = _newRequired;
        emit RequiredConfirmationsChanged(oldValue, _newRequired);
    }

    // Чтобы контракт мог получать ETH
    receive() external payable {
        // Просто принимаем ETH, без событий
    }
}