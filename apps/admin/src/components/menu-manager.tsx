'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { Menu, MenuItem, MenuItemTarget, MenuLocation } from '@/lib/api';

export function MenuManager() {
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadMenus();
  }, []);

  async function loadMenus() {
    setError('');

    try {
      const response = await fetch('/api/menus', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Menüler yüklenemedi.');
      }

      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menüler yüklenemedi.');
      setMenus([]);
    }
  }

  const headerMenu = menus?.find((menu) => menu.location === 'HEADER') ?? null;
  const footerMenu = menus?.find((menu) => menu.location === 'FOOTER') ?? null;

  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Menüler</h1>
      <p className="mt-2 text-zinc-400">Header ve footer menülerini oluşturun ve sıralayın.</p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {menus === null ? (
        <div className="mt-8 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-sm text-zinc-500">
          Yükleniyor...
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <MenuSection title="Header Menu" location="HEADER" menu={headerMenu} onChange={loadMenus} />
          <MenuSection title="Footer Menu" location="FOOTER" menu={footerMenu} onChange={loadMenus} />
        </div>
      )}
    </div>
  );
}

function MenuSection({
  title,
  location,
  menu,
  onChange,
}: {
  title: string;
  location: MenuLocation;
  menu: Menu | null;
  onChange: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateMenu() {
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, location }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Menü oluşturulamadı.');
      }

      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {error && (
        <div className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!menu ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">Bu konum için henüz menü oluşturulmadı.</p>
          <button
            type="button"
            onClick={handleCreateMenu}
            disabled={creating}
            className="mt-4 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Oluşturuluyor...' : `${title} Oluştur`}
          </button>
        </div>
      ) : (
        <MenuEditor menu={menu} onChange={onChange} />
      )}
    </div>
  );
}

function MenuEditor({ menu, onChange }: { menu: Menu; onChange: () => void }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<MenuItemTarget>('SELF');
  const [parentId, setParentId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editTarget, setEditTarget] = useState<MenuItemTarget>('SELF');
  const [editParentId, setEditParentId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const topLevelItems = menu.items;

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError('');

    try {
      const response = await fetch(`/api/menus/${menu.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          url,
          target,
          parentId: parentId.length > 0 ? parentId : undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Menü öğesi eklenemedi.');
      }

      setLabel('');
      setUrl('');
      setTarget('SELF');
      setParentId('');
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü öğesi eklenemedi.');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
    setEditTarget(item.target);
    setEditParentId(item.parentId ?? '');
  }

  async function handleSaveEdit(itemId: string) {
    setSavingEdit(true);
    setError('');

    try {
      const response = await fetch(`/api/menus/${menu.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel,
          url: editUrl,
          target: editTarget,
          parentId: editParentId.length > 0 ? editParentId : null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Menü öğesi güncellenemedi.');
      }

      setEditingId(null);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü öğesi güncellenemedi.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(itemId: string) {
    setDeletingId(itemId);
    setError('');

    try {
      const response = await fetch(`/api/menus/${menu.id}/items/${itemId}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Menü öğesi silinemedi.');
      }

      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Menü öğesi silinemedi.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleMove(siblings: MenuItem[], itemId: string, direction: 'up' | 'down') {
    const index = siblings.findIndex((item) => item.id === itemId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= siblings.length) {
      return;
    }

    const a = siblings[index];
    const b = siblings[targetIndex];

    setMovingId(itemId);
    setError('');

    try {
      const response = await fetch(`/api/menus/${menu.id}/items/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: a.id, sortOrder: b.sortOrder },
            { id: b.id, sortOrder: a.sortOrder },
          ],
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Sıralama güncellenemedi.');
      }

      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıralama güncellenemedi.');
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_2fr_1fr_1.3fr_auto]">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="URL"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <select
          value={target}
          onChange={(event) => setTarget(event.target.value as MenuItemTarget)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        >
          <option value="SELF">Aynı sekme</option>
          <option value="BLANK">Yeni sekme</option>
        </select>
        <select
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        >
          <option value="">Üst öğe yok</option>
          {topLevelItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? 'Ekleniyor...' : '+ Ekle'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        {topLevelItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">Henüz menü öğesi eklenmedi.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Üst Öğe</th>
                <th className="px-4 py-3 font-medium">Sıra</th>
                <th className="px-4 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {topLevelItems.map((item, index) => (
                <MenuItemRowGroup
                  key={item.id}
                  item={item}
                  index={index}
                  topLevelItems={topLevelItems}
                  editingId={editingId}
                  editLabel={editLabel}
                  editUrl={editUrl}
                  editTarget={editTarget}
                  editParentId={editParentId}
                  setEditLabel={setEditLabel}
                  setEditUrl={setEditUrl}
                  setEditTarget={setEditTarget}
                  setEditParentId={setEditParentId}
                  startEdit={startEdit}
                  cancelEdit={() => setEditingId(null)}
                  saveEdit={handleSaveEdit}
                  savingEdit={savingEdit}
                  confirmDeleteId={confirmDeleteId}
                  requestDelete={setConfirmDeleteId}
                  cancelDelete={() => setConfirmDeleteId(null)}
                  confirmDelete={handleDelete}
                  deletingId={deletingId}
                  movingId={movingId}
                  moveItem={handleMove}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface MenuItemRowGroupProps {
  item: Menu['items'][number];
  index: number;
  topLevelItems: Menu['items'];
  editingId: string | null;
  editLabel: string;
  editUrl: string;
  editTarget: MenuItemTarget;
  editParentId: string;
  setEditLabel: (value: string) => void;
  setEditUrl: (value: string) => void;
  setEditTarget: (value: MenuItemTarget) => void;
  setEditParentId: (value: string) => void;
  startEdit: (item: MenuItem) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  savingEdit: boolean;
  confirmDeleteId: string | null;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  confirmDelete: (id: string) => void;
  deletingId: string | null;
  movingId: string | null;
  moveItem: (siblings: MenuItem[], id: string, direction: 'up' | 'down') => void;
}

function MenuItemRowGroup({
  item,
  index,
  topLevelItems,
  editingId,
  editLabel,
  editUrl,
  editTarget,
  editParentId,
  setEditLabel,
  setEditUrl,
  setEditTarget,
  setEditParentId,
  startEdit,
  cancelEdit,
  saveEdit,
  savingEdit,
  confirmDeleteId,
  requestDelete,
  cancelDelete,
  confirmDelete,
  deletingId,
  movingId,
  moveItem,
}: MenuItemRowGroupProps) {
  const parentOptions = topLevelItems.filter((candidate) => candidate.id !== item.id);

  return (
    <>
      <MenuItemRow
        item={item}
        depth={0}
        parentLabel={null}
        isEditing={editingId === item.id}
        editLabel={editLabel}
        editUrl={editUrl}
        editTarget={editTarget}
        editParentId={editParentId}
        setEditLabel={setEditLabel}
        setEditUrl={setEditUrl}
        setEditTarget={setEditTarget}
        setEditParentId={setEditParentId}
        onStartEdit={() => startEdit(item)}
        onCancelEdit={cancelEdit}
        onSaveEdit={() => saveEdit(item.id)}
        savingEdit={savingEdit}
        confirmDelete={confirmDeleteId === item.id}
        onRequestDelete={() => requestDelete(item.id)}
        onCancelDelete={cancelDelete}
        onConfirmDelete={() => confirmDelete(item.id)}
        deleting={deletingId === item.id}
        onMoveUp={() => moveItem(topLevelItems, item.id, 'up')}
        onMoveDown={() => moveItem(topLevelItems, item.id, 'down')}
        canMoveUp={index > 0}
        canMoveDown={index < topLevelItems.length - 1}
        moving={movingId === item.id}
        parentOptions={parentOptions}
      />

      {item.children.map((child, childIndex) => (
        <MenuItemRow
          key={child.id}
          item={child}
          depth={1}
          parentLabel={item.label}
          isEditing={editingId === child.id}
          editLabel={editLabel}
          editUrl={editUrl}
          editTarget={editTarget}
          editParentId={editParentId}
          setEditLabel={setEditLabel}
          setEditUrl={setEditUrl}
          setEditTarget={setEditTarget}
          setEditParentId={setEditParentId}
          onStartEdit={() => startEdit(child)}
          onCancelEdit={cancelEdit}
          onSaveEdit={() => saveEdit(child.id)}
          savingEdit={savingEdit}
          confirmDelete={confirmDeleteId === child.id}
          onRequestDelete={() => requestDelete(child.id)}
          onCancelDelete={cancelDelete}
          onConfirmDelete={() => confirmDelete(child.id)}
          deleting={deletingId === child.id}
          onMoveUp={() => moveItem(item.children, child.id, 'up')}
          onMoveDown={() => moveItem(item.children, child.id, 'down')}
          canMoveUp={childIndex > 0}
          canMoveDown={childIndex < item.children.length - 1}
          moving={movingId === child.id}
          parentOptions={topLevelItems.filter((candidate) => candidate.id !== child.id)}
        />
      ))}
    </>
  );
}

interface MenuItemRowProps {
  item: MenuItem;
  depth: number;
  parentLabel: string | null;
  isEditing: boolean;
  editLabel: string;
  editUrl: string;
  editTarget: MenuItemTarget;
  editParentId: string;
  setEditLabel: (value: string) => void;
  setEditUrl: (value: string) => void;
  setEditTarget: (value: MenuItemTarget) => void;
  setEditParentId: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  savingEdit: boolean;
  confirmDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  deleting: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  moving: boolean;
  parentOptions: MenuItem[];
}

function MenuItemRow({
  item,
  depth,
  parentLabel,
  isEditing,
  editLabel,
  editUrl,
  editTarget,
  editParentId,
  setEditLabel,
  setEditUrl,
  setEditTarget,
  setEditParentId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  savingEdit,
  confirmDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  deleting,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  moving,
  parentOptions,
}: MenuItemRowProps) {
  if (isEditing) {
    return (
      <tr className="border-b border-zinc-800/60">
        <td colSpan={6} className="px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Label</label>
              <input
                value={editLabel}
                onChange={(event) => setEditLabel(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">URL</label>
              <input
                value={editUrl}
                onChange={(event) => setEditUrl(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Target</label>
              <select
                value={editTarget}
                onChange={(event) => setEditTarget(event.target.value as MenuItemTarget)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="SELF">Aynı sekme</option>
                <option value="BLANK">Yeni sekme</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Üst Öğe</label>
              <select
                value={editParentId}
                onChange={(event) => setEditParentId(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="">Üst öğe yok</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={savingEdit}
              className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Vazgeç
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-800/60 last:border-0">
      <td className="px-4 py-3 text-white">
        <span style={{ paddingLeft: depth * 20 }} className="inline-flex items-center">
          {depth > 0 && <span className="mr-1.5 text-zinc-600">└</span>}
          {item.label}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{item.url}</td>
      <td className="px-4 py-3 text-zinc-400">{item.target === 'BLANK' ? 'Yeni sekme' : 'Aynı sekme'}</td>
      <td className="px-4 py-3 text-zinc-400">{parentLabel ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || moving}
            aria-label="Yukarı taşı"
            className="rounded p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || moving}
            aria-label="Aşağı taşı"
            className="rounded p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        {confirmDelete ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-zinc-400">Emin misiniz?</span>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Vazgeç
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onStartEdit}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={onRequestDelete}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
            >
              Sil
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
