// services/priceListService.ts
import { PriceList, IPriceList } from './priceList.model';

export interface CreatePriceListData {
  partNo?: string;
  productName?: string;
  vendorName?: string;
  productBrand?: string;
  carBrand?: string;
  carModel?: string;
  mrp?: number;
  purchasePrice?: number;
  description?: {
    text?: string;
    jsonFields?: Record<string, any>;
  };
  status?: 'active' | 'inactive';
  createdBy?: string;
}

export interface UpdatePriceListData {
  partNo?: string | undefined;
  productName?: string | undefined;
  vendorName?: string | undefined;
  productBrand?: string | undefined;
  carBrand?: string | undefined;
  carModel?: string | undefined;
  mrp?: number | undefined;
  purchasePrice?: number | undefined;
  description?: {
    text?: string;
    jsonFields?: Record<string, any>;
} | undefined;
  status?: 'active' | 'inactive' | undefined;
}

export interface GetAllFilters {
  search?: string;
  status?: 'active' | 'inactive';
  vendorName?: string;
  carBrand?: string;
  productBrand?: string;
}

export class PriceListService {
  // Create new price list entry
  async createPriceList(data: CreatePriceListData): Promise<IPriceList> {
    try {
      // Ensure description has proper structure
      const processedData = this.processDescriptionData(data);
      const priceList = new PriceList(processedData);
      return await priceList.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Part number already exists for this vendor');
      }
      throw new Error(`Failed to create price list: ${error.message}`);
    }
  }

  // Bulk create price list entries
  async bulkCreatePriceList(entries: CreatePriceListData[]): Promise<{
    inserted: IPriceList[],
    duplicates: string[],
    errors: string[]
  }> {
    const inserted: IPriceList[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    for (const [index, entry] of entries.entries()) {
      try {
        // Ensure description has proper structure for each entry
        const processedEntry = this.processDescriptionData(entry);
        const priceList = new PriceList(processedEntry);
        const saved = await priceList.save();
        inserted.push(saved);
      } catch (error: any) {
        if (error.code === 11000) {
          duplicates.push(entry.partNo || `Entry ${index + 1}`);
        } else {
          errors.push(`Entry ${index + 1}: ${error.message}`);
        }
      }
    }

    return { inserted, duplicates, errors };
  }

  // Get all price list entries with search, pagination and filters
  async getAllPriceLists(
    page: number = 1,
    limit: number = 10,
    filters: GetAllFilters = {}
  ): Promise<{
    data: IPriceList[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build search query
      const query: Record<string, any> = {};

      // Search across multiple fields if search term provided
      if (filters.search) {
        const searchRegex = new RegExp(this.escapeRegex(filters.search), 'i');
        const searchConditions: Record<string, any>[] = [
          { partNo: searchRegex },
          { productName: searchRegex },
          { vendorName: searchRegex },
          { productBrand: searchRegex },
          { carBrand: searchRegex },
          { carModel: searchRegex },
          { 'description.text': searchRegex }, // Updated to search in description.text
        ];

        // Handle numeric search for MRP
        const numericSearch = parseFloat(filters.search);
        if (!isNaN(numericSearch)) {
          searchConditions.push({ mrp: numericSearch });
        }

        query.$or = searchConditions;
      }

      // Add other filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.vendorName) {
        query.vendorName = new RegExp(this.escapeRegex(filters.vendorName), 'i');
      }
      if (filters.carBrand) {
        query.carBrand = new RegExp(this.escapeRegex(filters.carBrand), 'i');
      }
      if (filters.productBrand) {
        query.productBrand = new RegExp(this.escapeRegex(filters.productBrand), 'i');
      }

      const total = await PriceList.countDocuments(query);
      const data = await PriceList.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch price lists: ${error.message}`);
    }
  }

  // Get price list by ID
  async getPriceListById(id: string): Promise<IPriceList | null> {
    try {
      return await PriceList.findById(id);
    } catch (error: any) {
      throw new Error(`Failed to fetch price list: ${error.message}`);
    }
  }

  // Get price list by part number
  async getPriceListByPartNo(partNo: string): Promise<IPriceList | null> {
    try {
      return await PriceList.findOne({ partNo: partNo.toUpperCase() });
    } catch (error: any) {
      throw new Error(`Failed to fetch price list: ${error.message}`);
    }
  }

  // Update price list
  async updatePriceList(id: string, data: UpdatePriceListData): Promise<IPriceList | null> {
    try {
      // Ensure description has proper structure for update
      const processedData = this.processDescriptionData(data);
      return await PriceList.findByIdAndUpdate(
        id,
        { ...processedData },
        { new: true, runValidators: true }
      );
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Part number already exists for this vendor');
      }
      throw new Error(`Failed to update price list: ${error.message}`);
    }
  }

  // Delete price list
  async deletePriceList(id: string): Promise<IPriceList | null> {
    try {
      return await PriceList.findByIdAndDelete(id);
    } catch (error: any) {
      throw new Error(`Failed to delete price list: ${error.message}`);
    }
  }

  // Helper function to process description data and ensure proper structure
  private processDescriptionData(data: CreatePriceListData | UpdatePriceListData): any {
    const processedData = { ...data };

    // Handle description transformation
    if (processedData.description) {
      // If description is provided as a string (backward compatibility), convert to object
      if (typeof processedData.description === 'string') {
        processedData.description = {
          text: processedData.description,
          jsonFields: {}
        };
      }
      // Ensure description has both text and jsonFields
      else if (typeof processedData.description === 'object') {
        processedData.description = {
          text: processedData.description.text || '',
          jsonFields: processedData.description.jsonFields || {}
        };
      }
    } else {
      // Set default empty description object if not provided
      processedData.description = {
        text: '',
        jsonFields: {}
      };
    }

    return processedData;
  }

  // Helper function to escape regex characters
  private escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
}

export const priceListService = new PriceListService();