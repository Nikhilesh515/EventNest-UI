import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ConfirmModal } from '../components/ConfirmModal';

interface TagData {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface TagsResponse {
  result: TagData[];
}

export function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTag, setEditTag] = useState<TagData | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [deleteTarget, setDeleteTarget] = useState<TagData | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/api/tags'),
  });

  const createMutation = useMutation({
    mutationFn: (values: { name: string; color: string }) => api.post('/api/tags', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setShowForm(false);
      setTagName('');
      setTagColor('#3b82f6');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: { id: string; name: string; color: string }) =>
      api.put(`/api/tags/${values.id}`, { name: values.name, color: values.color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setEditTag(null);
      setTagName('');
      setTagColor('#3b82f6');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setDeleteTarget(null);
    },
  });

  const tags = data?.result || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    if (editTag) {
      updateMutation.mutate({ id: editTag.id, name: tagName, color: tagColor });
    } else {
      createMutation.mutate({ name: tagName, color: tagColor });
    }
  };

  const startEdit = (tag: TagData) => {
    setEditTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setShowForm(true);
  };

  return (
    <div className="stack-6">
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'System', href: '/admin/users' }, { label: 'Tags' }]} />

      <header className="page-doc">
        <span className="washi page-doc__tape washi--shu" aria-hidden="true" />
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">手帳</span>
        <div className="page-doc__head">
          <p className="page-doc__overline">Admin · 手帳</p>
          <h1 className="page-doc__title">Tags</h1>
          <p className="page-doc__sub">{tags.length} tags</p>
        </div>
        <div className="page-doc__actions">
          <button type="button" className="btn btn--primary" onClick={() => { setShowForm(!showForm); setEditTag(null); setTagName(''); setTagColor('#3b82f6'); }}>
            {showForm ? 'Cancel' : '+ Create tag'}
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="clipboard" style={{ padding: 'var(--space-4)' }}>
          <h2 className="page-doc__overline">{editTag ? 'Edit tag' : 'New tag'}</h2>
          <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
            <div className="field">
              <label className="field__label" htmlFor="tag-name">Name</label>
              <input
                id="tag-name"
                className="input"
                type="text"
                maxLength={100}
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="tag-color">Color</label>
              <input
                id="tag-color"
                className="input"
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--sm" style={{ marginTop: 'var(--space-3)' }} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Saving…' : editTag ? 'Save changes' : 'Create tag'}
          </button>
        </form>
      )}

      <div className="table-scroll">
        <table className="table-punch">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Color</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading…</td></tr>
            ) : tags.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No tags yet.</td></tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id}>
                  <td>
                    <span className="tag-chip tag-chip--md">
                      <span className="tag-chip__dot" style={{ backgroundColor: tag.color }} />
                      <span className="tag-chip__label">{tag.name}</span>
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, backgroundColor: tag.color }} />
                      <span className="tnum">{tag.color}</span>
                    </span>
                  </td>
                  <td>
                    <div className="cluster">
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => startEdit(tag)}>Edit</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(tag)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete tag "${deleteTarget?.name}"?`}
        body="This tag will be removed from all events."
        confirmLabel="Delete tag"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
