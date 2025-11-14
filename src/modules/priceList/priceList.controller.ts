// controllers/priceListController.ts
import { Request, Response } from 'express';
import { 
  priceListService, 
  CreatePriceListData, 
  GetAllFilters 
} from './priceList.service';

export const priceListController = {
  // Create single price list entry
  createPriceList: async (req: Request, res: Response) => {
    try {
      const priceListData: CreatePriceListData = req.body;
      
      // Validate required fields for creation
    //   if (!priceListData.partNo || !priceListData.productName) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Part number and product name are required'
    //     });
    //   }

      const priceList = await priceListService.createPriceList(priceListData);
      
      res.status(201).json({
        success: true,
        message: 'Price list created successfully',
        data: priceList
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Bulk create price list entries
  bulkCreatePriceList: async (req: Request, res: Response) => {
    try {
      const { entries } = req.body;
      
    //   if (!Array.isArray(entries) || entries.length === 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Entries must be a non-empty array'
    //     });
    //   }

      const result = await priceListService.bulkCreatePriceList(entries);
      
      const response: any = {
        success: true,
        message: `Successfully created ${result.inserted.length} entries`,
        data: {
          inserted: result.inserted.length,
          duplicates: result.duplicates
        }
      };

      // Add errors to response if any
      if (result.errors.length > 0) {
        response.errors = result.errors;
      }

      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all price lists with search, pagination and filters
  getAllPriceLists: async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      
      // Build filters
      const filters: GetAllFilters = {};
      
      // Search across multiple fields
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      // Individual filters
      if (req.query.status) {
        filters.status = req.query.status as 'active' | 'inactive';
      }
      if (req.query.vendorName) {
        filters.vendorName = req.query.vendorName as string;
      }
      if (req.query.carBrand) {
        filters.carBrand = req.query.carBrand as string;
      }
      if (req.query.productBrand) {
        filters.productBrand = req.query.productBrand as string;
      }

      const result = await priceListService.getAllPriceLists(page, limit, filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get price list by ID
  getPriceListById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const priceList = await priceListService.getPriceListById(id as string);
      
      if (!priceList) {
        return res.status(404).json({
          success: false,
          message: 'Price list not found'
        });
      }

      res.json({
        success: true,
        data: priceList
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update price list
  updatePriceList: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: CreatePriceListData = req.body;
      
      const updatedPriceList = await priceListService.updatePriceList(id as string, updateData);
      
      if (!updatedPriceList) {
        return res.status(404).json({
          success: false,
          message: 'Price list not found'
        });
      }

      res.json({
        success: true,
        message: 'Price list updated successfully',
        data: updatedPriceList
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete price list
  deletePriceList: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedPriceList = await priceListService.deletePriceList(id as string);
      
      if (!deletedPriceList) {
        return res.status(404).json({
          success: false,
          message: 'Price list not found'
        });
      }

      res.json({
        success: true,
        message: 'Price list deleted successfully',
        data: deletedPriceList
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};