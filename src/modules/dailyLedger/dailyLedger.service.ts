import DailyLedger, { IDailyLedger } from './dailyLedger.model';

// Create new ledger entry
export const createDailyLedger = async (input: IDailyLedger): Promise<IDailyLedger> => {
  const ledger = new DailyLedger(input);
  return await ledger.save();
};

// Get ledger by partyId with enhanced search functionality
export const getLedgerByPartyId = async (
  partyId: string, 
  searchText?: string
): Promise<IDailyLedger[]> => {
  let query: any = { partyId, status: "active" };

  if (searchText && searchText.trim() !== '') {
    const searchRegex = new RegExp(searchText, 'i');
    
    // Try to parse numeric search for credit, debit, tds fields
    const numericSearch = parseFloat(searchText);
    const isNumericSearch = !isNaN(numericSearch);

    query.$or = [
      { voucher: searchRegex },
      { srNo: searchRegex },
      { date: searchRegex },
      { description: searchRegex },
      ...(isNumericSearch ? [
        { credit: numericSearch },
        { debit: numericSearch },
        // { tdsDeductByParty: numericSearch },
        // { tdsDeductBySelf: numericSearch }
      ] : [])
    ];
  }

  return await DailyLedger.find(query).sort({ date: 1, createdAt: 1 });
};

// Get ledger entry by ID
export const getLedgerById = async (id: string): Promise<IDailyLedger | null> => {
  return await DailyLedger.findOne({ _id: id, status: "active" });
};

// Update ledger entry
export const updateDailyLedger = async (
  id: string, 
  updateData: IDailyLedger
): Promise<IDailyLedger | null> => {
  // Check if the entry exists and is active
  const existingLedger = await getLedgerById(id);
  if (!existingLedger) {
    throw new Error('Ledger entry not found or inactive');
  }

  return await DailyLedger.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
};

// Delete ledger entry (soft delete by setting status to inactive)
export const deleteDailyLedger = async (id: string): Promise<IDailyLedger | null> => {
  const ledger = await getLedgerById(id);
  if (!ledger) {
    throw new Error('Ledger entry not found or already deleted');
  }

  return await DailyLedger.findByIdAndUpdate(
    id,
    { status: "inactive", updatedAt: new Date() },
    { new: true }
  );
};

// Get all ledgers with enhanced search
export const getAllLedgers = async (searchText?: string): Promise<IDailyLedger[]> => {
  let query: any = { status: "active" };

  if (searchText && searchText.trim() !== '') {
    const searchRegex = new RegExp(searchText, 'i');
    
    // Try to parse numeric search for credit, debit, tds fields
    const numericSearch = parseFloat(searchText);
    const isNumericSearch = !isNaN(numericSearch);

    query.$or = [
      { partyId: searchRegex },
      { voucher: searchRegex },
      { srNo: searchRegex },
      { date: searchRegex },
      { description: searchRegex },
      ...(isNumericSearch ? [
        { credit: numericSearch },
        { debit: numericSearch },
        // { tdsDeductByParty: numericSearch },
        // { tdsDeductBySelf: numericSearch }
      ] : [])
    ];
  }

  return await DailyLedger.find(query).sort({ date: -1, createdAt: -1 });
};

// Get ledger summary by partyId
export const getLedgerSummary = async (partyId: string): Promise<{
  totalCredit: number;
  totalDebit: number;
//   totalTdsByParty: number;
//   totalTdsBySelf: number;
  balance: number;
}> => {
  const ledgers = await DailyLedger.find({ partyId, status: "active" });
  
  const totalCredit = ledgers.reduce((sum, ledger) => sum + (ledger.credit || 0), 0);
  const totalDebit = ledgers.reduce((sum, ledger) => sum + (ledger.debit || 0), 0);
//   const totalTdsByParty = ledgers.reduce((sum, ledger) => sum + (ledger.tdsDeductByParty || 0), 0);
//   const totalTdsBySelf = ledgers.reduce((sum, ledger) => sum + (ledger.tdsDeductBySelf || 0), 0);
  
  const balance = totalCredit - totalDebit;

  return {
    totalCredit,
    totalDebit,
    // totalTdsByParty,
    // totalTdsBySelf,
    balance
  };
};