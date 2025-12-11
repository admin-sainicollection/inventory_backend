import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import {
    addEmployeeService,
    updateEmployeeService,
    getEmployeesService,
    getEmployeeByIdService,
    deleteEmployeeService,
    updateEmployeeStatusService,
    getEmployeeStatsService
} from './employee.service';

interface TypedRequest<T = any, P extends ParamsDictionary = ParamsDictionary, Q = ParsedQs> extends Request<P, any, T, Q> {
    body: T;
    params: P;
    query: Q;
    files?: any;
}

export const addEmployee = async (req: TypedRequest, res: Response): Promise<void> => {
    try {
        const result = await addEmployeeService(req.body, req.files);
        console.log("FILES:", req.files);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Add employee error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateEmployee = async (req: TypedRequest<{}, { id: string }>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await updateEmployeeService(id, req.body, req.files);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Update employee error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getEmployees = async (req: TypedRequest<{}, ParamsDictionary, {
    search?: string;
    page?: string;
    limit?: string;
    status?: string;
    gender?: string;
    employee_type?: string;
    min_salary?: string;
    max_salary?: string;
}>, res: Response): Promise<void> => {
    try {
        const { 
            search, 
            page = '1', 
            limit = '10', 
            status, 
            gender, 
            employee_type,
            min_salary,
            max_salary
        } = req.query;
        
        // Build filters object
        const filters: Record<string, any> = {};
        if (status) filters.status = status;
        if (gender) filters.gender = gender;
        if (employee_type) filters['job.employee_type'] = employee_type;
        
        // Salary filters
        if (min_salary || max_salary) {
            filters['job.base_salary'] = {};
            if (min_salary) filters['job.base_salary'].$gte = Number(min_salary);
            if (max_salary) filters['job.base_salary'].$lte = Number(max_salary);
        }
        
        const result = await getEmployeesService(
            filters, 
            search || '', 
            parseInt(page), 
            parseInt(limit)
        );
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Get employees error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getEmployeeById = async (req: TypedRequest<{}, { id: string }>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await getEmployeeByIdService(id);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Get employee error:', error);
        if (error.message === 'Employee not found') {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

export const deleteEmployee = async (req: TypedRequest<{}, { id: string }>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await deleteEmployeeService(id);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Delete employee error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateEmployeeStatus = async (
    req: TypedRequest<{ status: 'active' | 'inactive' }, { id: string }>, 
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive'].includes(status)) {
            res.status(400).json({
                status: 'error',
                message: 'Status must be either "active" or "inactive"'
            });
            return;
        }
        
        const result = await updateEmployeeStatusService(id, status);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Update status error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getEmployeeStats = async (req: TypedRequest, res: Response): Promise<void> => {
    try {
        const result = await getEmployeeStatsService();
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Get stats error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};