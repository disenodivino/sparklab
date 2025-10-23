"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit3, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

type FormRow = {
  id: number;
  title: string;
  description: string | null;
  form_link: string;
  created_at: string | null;
  deadline: string | null;
};

export default function SubmissionsPage() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(false);

  // dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormRow | null>(null);

  // form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formLink, setFormLink] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('forms').select('*').order('id', { ascending: true });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to load forms' });
      console.error(error);
      return;
    }
    setForms((data as FormRow[]) || []);
  };

  const openAddDialog = () => {
    setEditingForm(null);
    setTitle('');
    setDescription('');
    setFormLink('');
    setDeadline('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (form: FormRow) => {
    setEditingForm(form);
    setTitle(form.title);
    setDescription(form.description || '');
    setFormLink(form.form_link);
    // Normalize stored deadline into a datetime-local value for editing
    if (form.deadline) {
      const raw = String(form.deadline);
      // If the stored value already is a datetime-local-like string (no timezone), use first 16 chars
      // e.g. '2025-10-23T19:00' or '2025-10-23T19:00:00'
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
        setDeadline(raw.slice(0, 16));
      } else {
        // Fallback: parse as Date and convert to local datetime-local format
        const d = new Date(raw);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setDeadline(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
    } else {
      setDeadline('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !formLink.trim()) {
      toast({ title: 'Validation', description: 'Title and form link are required' });
      return;
    }

    try {
  // Store the deadline exactly as entered (datetime-local value) so it round-trips
  // Use full minute precision ("YYYY-MM-DDTHH:mm")
  const deadlineForDb = deadline ? deadline : null;
      // Normalize form link to ensure it includes protocol
      let normalizedFormLink = formLink.trim();
      if (!/^https?:\/\//i.test(normalizedFormLink)) {
        normalizedFormLink = `https://${normalizedFormLink}`;
      }

      if (editingForm) {
        const { data, error } = await supabase
          .from('forms')
          .update({ title, description: description || null, form_link: normalizedFormLink, deadline: deadlineForDb })
          .eq('id', editingForm.id)
          .select()
          .single();

        if (error) throw error;
        toast({ title: 'Updated', description: 'Form updated' });
      } else {
        const { data, error } = await supabase
          .from('forms')
          .insert({ title, description: description || null, form_link: normalizedFormLink, deadline: deadlineForDb })
          .select()
          .single();

        if (error) throw error;
        toast({ title: 'Created', description: 'Form created' });
      }

      setIsDialogOpen(false);
      fetchForms();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save form' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete form' });
      console.error(error);
      return;
    }
    toast({ title: 'Deleted', description: 'Form deleted' });
    fetchForms();
  };

  const formatDeadlineDisplay = (val: string | null | undefined) => {
    if (!val) return '—';
    // If stored value is a datetime-local (no timezone), show it as entered (YYYY-MM-DD HH:mm)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
      return val.replace('T', ' ');
    }
    // Otherwise try to parse and show a locale string
    try {
      return new Date(val).toLocaleString();
    } catch (e) {
      return String(val);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Submission Forms</h1>
          <p className="text-muted-foreground">Create and manage submission forms for participants</p>
        </div>
        <div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add submission form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No submission forms yet. Click &quot;Add submission form&quot; to create one.</p>
            </CardContent>
          </Card>
        ) : (
          forms.map((f) => (
            <Card key={f.id}>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {f.form_link && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={f.form_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEditDialog(f)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(f.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Deadline: {formatDeadlineDisplay(f.deadline)}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingForm ? 'Edit submission form' : 'Add submission form'}</DialogTitle>
            <DialogDescription>Provide the form details that participants will use to submit.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />

            <label className="text-sm font-medium">Form link</label>
            <Input value={formLink} onChange={(e) => setFormLink(e.target.value)} />

            <label className="text-sm font-medium">Deadline</label>
            <div>
              <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingForm ? 'Save changes' : 'Create form'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}