
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import type { Branch } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [newBranchName, setNewBranchName] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        try {
            const savedBranches = sessionStorage.getItem('branchData');
            if (savedBranches) {
                setBranches(JSON.parse(savedBranches));
            }
        } catch (error) {
            console.error("Failed to parse branch data from sessionStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!loading) {
            sessionStorage.setItem('branchData', JSON.stringify(branches));
        }
    }, [branches, loading]);

    const handleAddBranch = () => {
        if (newBranchName.trim() === '') {
            toast({
                title: "Error",
                description: "Branch name cannot be empty.",
                variant: "destructive",
            });
            return;
        }
        if (branches.some(branch => branch.name.toLowerCase() === newBranchName.trim().toLowerCase())) {
             toast({
                title: "Error",
                description: "This branch already exists.",
                variant: "destructive",
            });
            return;
        }

        const newBranch: Branch = {
            id: uuidv4(),
            name: newBranchName.trim(),
        };
        setBranches(prevBranches => [...prevBranches, newBranch]);
        setNewBranchName('');
        toast({
            title: "Success",
            description: `Branch "${newBranch.name}" has been added.`,
        });
    };

    const handleDeleteBranch = (branchId: string) => {
        // TODO: Check if any employee is assigned to this branch before deleting.
        setBranches(prevBranches => prevBranches.filter(branch => branch.id !== branchId));
        toast({
            title: "Branch Deleted",
            description: "The branch has been successfully deleted.",
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Branch Management</CardTitle>
                    <CardDescription>
                        Add, view, or manage branches for your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Enter new branch name"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddBranch()}
                        />
                        <Button onClick={handleAddBranch}>Add Branch</Button>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Branch Name</TableHead>
                                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">Loading branches...</TableCell>
                                    </TableRow>
                                ) : branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell className="font-medium">{branch.name}</TableCell>
                                            <TableCell className="text-right">
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. Deleting this branch might affect employees assigned to it.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteBranch(branch.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">No branches found. Add one above.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
