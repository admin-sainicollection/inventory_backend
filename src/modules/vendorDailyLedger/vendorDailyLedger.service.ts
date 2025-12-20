import VendorDailyLedger, { IVendorDailyLedger } from './vendorDailyLedger.model';

// Create new ledger entry
export const createVendorDailyLedger = async (input: IVendorDailyLedger): Promise<IVendorDailyLedger> => {
  const ledger = new VendorDailyLedger(input);
  return await ledger.save();
};

// Get ledger by vendorId with enhanced search functionality
export const getVendorLedgerByVendorId = async (
  vendorId: string, 
  searchText?: string
): Promise<IVendorDailyLedger[]> => {
  let query: any = { vendorId, status: "active" };

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

  return await VendorDailyLedger.find(query).sort({ date: 1, createdAt: 1 });
};

// Get ledger entry by ID
export const getVendorLedgerById = async (id: string): Promise<IVendorDailyLedger | null> => {
  return await VendorDailyLedger.findOne({ _id: id, status: "active" });
};

// Update ledger entry
export const updateVendorDailyLedger = async (
  id: string, 
  updateData: IVendorDailyLedger
): Promise<IVendorDailyLedger | null> => {
  // Check if the entry exists and is active
  const existingLedger = await getVendorLedgerById(id);
  if (!existingLedger) {
    throw new Error('Ledger entry not found or inactive');
  }

  return await VendorDailyLedger.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
};

// Delete ledger entry (soft delete by setting status to inactive)
export const deleteVendorDailyLedger = async (id: string): Promise<IVendorDailyLedger | null> => {
  const ledger = await getVendorLedgerById(id);
  if (!ledger) {
    throw new Error('Ledger entry not found or already deleted');
  }

  return await VendorDailyLedger.findByIdAndUpdate(
    id,
    { status: "inactive", updatedAt: new Date() },
    { new: true }
  );
};

// Get all ledgers with enhanced search
export const getAllVendorLedgers = async (searchText?: string): Promise<IVendorDailyLedger[]> => {
  let query: any = { status: "active" };

  if (searchText && searchText.trim() !== '') {
    const searchRegex = new RegExp(searchText, 'i');
    
    // Try to parse numeric search for credit, debit, tds fields
    const numericSearch = parseFloat(searchText);
    const isNumericSearch = !isNaN(numericSearch);

    query.$or = [
      { vendorId: searchRegex },
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

  return await VendorDailyLedger.find(query).sort({ date: -1, createdAt: -1 });
};

// Get ledger summary by vendorId
export const getVendorLedgerSummary = async (vendorId: string): Promise<{
  totalCredit: number;
  totalDebit: number;
//   totalTdsByParty: number;
//   totalTdsBySelf: number;
  balance: number;
}> => {
  const ledgers = await VendorDailyLedger.find({ vendorId, status: "active" });
  
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