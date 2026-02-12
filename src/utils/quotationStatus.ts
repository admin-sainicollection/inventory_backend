import { QuotationStatus } from "../modules/sales/types";

export const getQuotationStatus = (
  expiryDate?: Date | string | undefined,
  isConverted?: boolean,
  isClosed?: boolean
): QuotationStatus => {

  const today = new Date();

  if (isConverted) return 'CONVERTED';

  if (isClosed) return 'CLOSED';

  if (expiryDate && new Date(expiryDate) < today)
    return 'EXPIRED';

  return 'OPEN';
};
