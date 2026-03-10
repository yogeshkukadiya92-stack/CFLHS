'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddKraDialog } from '@/components/add-kra-dialog';
import type { Employee, KRA, Branch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Protected } from '@/components/protected';
import { PlusCircle, ListChecks, Download, Upload, FileSpreadsheet, ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import { getYear, getMonth, startOfMonth, endOfMonth, format } from 'date-fns';
import { useDataStore } from '@/hooks/use-data-store';
import { KraTable } from '@/components/kra-table';
import { useAuth } from '@/components/auth-provider';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';


function KraManagementPage() {
  const { 
    kras, 
    loading, 
    employees, 
    handleSaveKra, 
    handleDeleteKra,
    handleDeleteMultipleKras
  } = useDataStore();
  const [selectedBranch, setSelectedBranch] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState<string>(String(getYear(new Date())));
  const [selectedMonth, setSelectedMonth] = React.useState<string>('all');
  const [showControls, setShowControls] = React.useState(true);
  const { currentUser, getPermission } = useAuth();
  const pagePermission = getPermission('employees'); 
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { filteredKras, branchOptions, availableYears, availableMonths } = React.useMemo(() => {
        let krasToProcess = kras;

        if (pagePermission === 'employee_only' && currentUser) {
            krasToProcess = kras.filter(k => k.employee.id === currentUser.id);
        }

        const filteredByBranch = selectedBranch === 'all' 
            ? krasToProcess
            : krasToProcess.filter(k => k.employee.branch === selectedBranch);

        const filteredKrasByDate = filteredByBranch.filter(kra => {
            if (selectedYear === 'all' && selectedMonth === 'all') return true;
            
            const year = parseInt(selectedYear);
            const month = parseInt(selectedMonth);
            const kraStart = new Date(kra.startDate);
            const kraEnd = new Date(kra.endDate);

            if (selectedYear !== 'all' && selectedMonth === 'all') {
                return getYear(kraStart) <= year && getYear(kraEnd) >= year;
            }
            if (selectedYear !== 'all' && selectedMonth !== 'all') {
                 const monthStart = startOfMonth(new Date(year, month));
                 const monthEnd = endOfMonth(new Date(year, month));
                 return kraStart <= monthEnd && kraEnd >= monthStart;
            }
            return true;
        });

        const allEmployees: Employee[] = Array.from(new Map(kras.map(kra => [kra.employee.id, kra.employee])).values());
        const uniqueBranches = ['all', ...Array.from(new Set(allEmployees.map(e => e.branch).filter(Boolean)))];

        const yearsSet = new Set<number>();
        kras.forEach(kra => {
            yearsSet.add(getYear(new Date(kra.startDate)));
            yearsSet.add(getYear(new Date(kra.endDate)));
        });
         if (!yearsSet.has(getYear(new Date()))) {
            yearsSet.add(getYear(new Date()));
        }

        const monthMap = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return { 
            filteredKras: filteredKrasByDate, 
            branchOptions: uniqueBranches, 
            availableYears: Array.from(yearsSet).sort((a, b) => b - a),
            availableMonths: monthMap
        };

    }, [kras, pagePermission, currentUser, selectedBranch, selectedYear, selectedMonth]);

    const handleExport = () => {
        const dataToExport = filteredKras.map(k => ({
            'Employee ID': k.employee.id,
            'Employee Name': k.employee.name,
            'Task Description': k.taskDescription,
            'Weightage': k.weightage,
            'Target': k.target,
            'Achieved': k.achieved,
            'Marks Achieved': k.marksAchieved,
            'Bonus': k.bonus,
            'Penalty': k.penalty,
            'End Date': format(new Date(k.endDate), 'yyyy-MM-dd')
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'KRAs');
        XLSX.writeFile(workbook, `KRA_Data_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        toast({ title: "Export Successful", description: "KRA data has been exported." });
    };

    const handleDownloadSample = () => {
        const sampleData = [
            {
                'Employee ID': 'EMP001',
                'Task Description': 'Achieve 100% sales target',
                'Weightage': 20,
                'Target': 100000,
                'Achieved': 0,
                'Marks Achieved': 0,
                'Bonus': 0,
                'Penalty': 0,
                'End Date': '2024-12-31'
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_KRA');
        XLSX.writeFile(workbook, 'Sample_KRA_Template.xlsx');
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                const importedKras: KRA[] = json.map((row, index) => {
                    const employeeId = String(row['Employee ID']);
                    const employee = employees.find(emp => emp.id === employeeId);
                    if (!employee) {
                        throw new Error(`Row ${index + 2}: Employee with ID "${employeeId}" not found.`);
                    }

                    return {
                        id: `kra-${Date.now()}-${index}`,
                        employee: employee,
                        taskDescription: String(row['Task Description'] || ''),
                        weightage: Number(row['Weightage']) || 0,
                        target: Number(row['Target']) || 0,
                        achieved: Number(row['Achieved']) || 0,
                        marksAchieved: Number(row['Marks Achieved']) || 0,
                        bonus: Number(row['Bonus']) || 0,
                        penalty: Number(row['Penalty']) || 0,
                        endDate: row['End Date'] ? new Date(row['End Date']) : new Date(),
                        startDate: new Date(),
                        progress: 0,
                        status: 'Pending'
                    };
                });

                importedKras.forEach(handleSaveKra);
                toast({ title: "Import Successful", description: `${json.length} KRAs imported.` });

            } catch(error: any) {
                toast({ title: "Import Failed", description: error.message, variant: 'destructive' });
            } finally {
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

  return (
     <TooltipProvider>
        <div className="flex-1 flex flex-col gap-4">
            <Card className='professional-card'>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 p-2 rounded-lg text-primary'>
                            <ListChecks className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className='text-lg'>KRA Management</CardTitle>
                            {!showControls && <CardDescription className='text-[10px]'>Filters hidden • Total KRAs: {filteredKras.length}</CardDescription>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowControls(!showControls)}
                                    className="h-8 w-8 p-0 rounded-full"
                                >
                                    {showControls ? <ChevronUp className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{showControls ? 'Hide Controls' : 'Show Controls'}</TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>

                {showControls && (
                    <CardContent className="p-4 pt-0 border-b bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[100px] h-8 text-[11px] bg-white"><SelectValue placeholder="Year" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-[11px]">All Years</SelectItem>
                                        {availableYears.map(y => <SelectItem key={y} value={String(y)} className="text-[11px]">{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={selectedYear === 'all'}>
                                    <SelectTrigger className="w-[110px] h-8 text-[11px] bg-white"><SelectValue placeholder="Month" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-[11px]">All Months</SelectItem>
                                        {availableMonths.map((month, index) => <SelectItem key={index} value={String(index)} className="text-[11px]">{month}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {pagePermission !== 'employee_only' && (
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                        <SelectTrigger className="w-[140px] h-8 text-[11px] bg-white"><SelectValue placeholder="Department" /></SelectTrigger>
                                        <SelectContent>
                                            {branchOptions.map(branch => <SelectItem key={branch} value={branch} className="text-[11px]">{branch === 'all' ? 'All Depts.' : branch}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {pagePermission === 'download' && (
                                    <div className="flex items-center gap-1.5">
                                        <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={handleDownloadSample} className="h-8 text-[10px] gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" /> Sample</Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Template</TooltipContent>
                                        </Tooltip>
                                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 text-[10px] gap-1.5"><Upload className="h-3.5 w-3.5" /> Import</Button>
                                        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-[10px] gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
                                    </div>
                                )}
                                {(pagePermission === 'edit' || pagePermission === 'download') && (
                                    <AddKraDialog onSave={handleSaveKra} employees={employees}>
                                        <Button size="sm" className="h-8 text-[10px] gap-1.5">
                                            <PlusCircle className="h-3.5 w-3.5" /> Add KRA
                                        </Button>
                                    </AddKraDialog>
                                )}
                            </div>
                        </div>
                    </CardContent>
                )}

                <CardContent className="p-0 sm:p-4">
                    {loading ? (
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <KraTable 
                           kras={filteredKras}
                           employees={employees}
                           onSave={handleSaveKra}
                           onDelete={handleDeleteKra}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
     </TooltipProvider>
  );
}

export default function KRAManagement() {
    return (
        <Protected>
            <KraManagementPage />
        </Protected>
    )
}
