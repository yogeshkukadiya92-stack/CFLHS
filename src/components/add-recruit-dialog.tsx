
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Recruit, RecruitmentStatus } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns';

const recruitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  position: z.string().min(1, 'Position is required.'),
  branch: z.string().optional(),
  appliedDate: z.date(),
  status: z.enum(['Applied', 'Screening', 'Interview', 'Second Round', 'Offered', 'Hired', 'Rejected', 'Comment']),
  notes: z.string().optional(),
  comment: z.string().optional(),
  expectedSalary: z.coerce.number().optional(),
  workExperience: z.string().optional(),
  qualification: z.string().optional(),
  location: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

type RecruitFormValues = z.infer<typeof recruitSchema>;

interface AddRecruitDialogProps {
  children: React.ReactNode;
  recruit?: Recruit;
  onSave: (recruit: Recruit) => void;
}

export function AddRecruitDialog({ children, recruit, onSave }: AddRecruitDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecruitFormValues>({
    resolver: zodResolver(recruitSchema),
    defaultValues: {
      name: recruit?.name || '',
      email: recruit?.email || '',
      phone: recruit?.phone || '',
      position: recruit?.position || '',
      branch: recruit?.branch || '',
      appliedDate: recruit?.appliedDate || new Date(),
      status: recruit?.status || 'Applied',
      notes: recruit?.notes || '',
      comment: recruit?.comment || '',
      expectedSalary: recruit?.expectedSalary || undefined,
      workExperience: recruit?.workExperience || '',
      qualification: recruit?.qualification || '',
      location: recruit?.location || '',
      resumeUrl: recruit?.resumeUrl || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: recruit?.name || '',
        email: recruit?.email || '',
        phone: recruit?.phone || '',
        position: recruit?.position || '',
        branch: recruit?.branch || '',
        appliedDate: recruit?.appliedDate ? new Date(recruit.appliedDate) : new Date(),
        status: recruit?.status || 'Applied',
        notes: recruit?.notes || '',
        comment: recruit?.comment || '',
        expectedSalary: recruit?.expectedSalary || undefined,
        workExperience: recruit?.workExperience || '',
        qualification: recruit?.qualification || '',
        location: recruit?.location || '',
        resumeUrl: recruit?.resumeUrl || '',
      });
    }
  }, [open, recruit, reset]);


  const onSubmit = (data: RecruitFormValues) => {
    const newRecruit: Recruit = {
      id: recruit?.id || uuidv4(),
      avatarUrl: recruit?.avatarUrl || `https://placehold.co/32x32.png?text=${data.name.charAt(0)}`,
      ...data,
    };
    onSave(newRecruit);
    toast({
      title: recruit ? 'Candidate Updated' : 'Candidate Added',
      description: `The data for ${data.name} has been saved.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{recruit ? 'Edit Candidate Data' : 'Add New Candidate'}</DialogTitle>
            <DialogDescription>
              {recruit ? 'Update the details for this candidate.' : 'Fill in the details for a new candidate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 grid-cols-1 md:grid-cols-2">
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" {...field} placeholder="e.g., Sunil Kumar" />}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="position">Position Applied For</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => <Input id="position" {...field} placeholder="e.g., Marketing Head" />}
              />
              {errors.position && <p className="text-xs text-destructive mt-1">{errors.position.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input id="email" type="email" {...field} placeholder="sunil.k@example.com" />}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input id="phone" type="tel" {...field} placeholder="9876543210" />}
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => <Input id="location" {...field} placeholder="e.g., Pune" />}
              />
               {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Controller
                name="qualification"
                control={control}
                render={({ field }) => <Input id="qualification" {...field} placeholder="e.g., B.Tech in CS" />}
              />
               {errors.qualification && <p className="text-xs text-destructive mt-1">{errors.qualification.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Controller
                name="workExperience"
                control={control}
                render={({ field }) => <Input id="workExperience" {...field} placeholder="e.g., 5 Years or Fresher" />}
              />
               {errors.workExperience && <p className="text-xs text-destructive mt-1">{errors.workExperience.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Expected Salary (LPA)</Label>
              <Controller
                name="expectedSalary"
                control={control}
                render={({ field }) => <Input id="expectedSalary" type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} placeholder="e.g., 12.5" />}
              />
               {errors.expectedSalary && <p className="text-xs text-destructive mt-1">{errors.expectedSalary.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliedDate">Applied On</Label>
              <Controller
                name="appliedDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="appliedDate"
                    type="date"
                    value={format(new Date(field.value), 'yyyy-MM-dd')}
                    onChange={e => field.onChange(new Date(e.target.value))}
                  />
                )}
              />
              {errors.appliedDate && <p className="text-xs text-destructive mt-1">{errors.appliedDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
               <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Applied">Applied</SelectItem>
                              <SelectItem value="Screening">Screening</SelectItem>
                              <SelectItem value="Interview">Interview</SelectItem>
                              <SelectItem value="Second Round">Second Round</SelectItem>
                              <SelectItem value="Offered">Offered</SelectItem>
                              <SelectItem value="Hired">Hired</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="Comment">Comment</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
               {errors.status && <p className="text-xs text-destructive mt-1">{errors.status.message}</p>}
            </div>
            
             <div className="space-y-2 md:col-span-2">
              <Label htmlFor="branch">Branch/Department</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => <Input id="branch" {...field} placeholder="e.g., Marketing" />}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="resumeUrl">Resume Link (Google Drive)</Label>
              <Controller
                name="resumeUrl"
                control={control}
                render={({ field }) => <Input id="resumeUrl" {...field} placeholder="https://docs.google.com/document/..." />}
              />
               {errors.resumeUrl && <p className="text-xs text-destructive mt-1">{errors.resumeUrl.message}</p>}
            </div>

             <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => <Textarea id="notes" {...field} placeholder="Add any notes about the candidate..." />}
              />
            </div>

             <div className="space-y-2 md:col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Controller
                name="comment"
                control={control}
                render={({ field }) => <Textarea id="comment" {...field} placeholder="Add a final comment..." />}
              />
            </div>

          </div>
          <DialogFooter className="pt-4">
            <Button type="submit">Save Candidate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
