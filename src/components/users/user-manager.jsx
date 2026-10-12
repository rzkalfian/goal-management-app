"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  AddCircleIcon,
  PenIcon,
  TrashBinTrashIcon,
} from "@solar-icons/react/linear";
import { useResource } from "@/components/hooks/use-resource";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/ui/feedback";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { UserForm } from "@/components/forms/user-form";

export function UserManager({ currentUser }) {
  const resource = useResource("/api/users");
  const developer = currentUser.role === "DEVELOPER";
  const [editor, setEditor] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  function refresh(message) {
    resource.refresh();
    setNotice(message);
  }
  function saved(self) {
    if (self) signOut({ callbackUrl: "/login" });
    else refresh("Pengguna berhasil disimpan.");
  }
  return (
    <>
      <PageHeading
        title="Pengguna"
        subtitle={
          developer
            ? "Kelola akun dan akses Admin atau Developer."
            : "Daftar pengguna. Perubahan akun hanya dapat dilakukan Developer."
        }
      >
        {developer && (
          <Button onClick={() => setEditor(null)}>
            <AddCircleIcon size={18} />
            Tambah pengguna
          </Button>
        )}
      </PageHeading>
      {notice && (
        <p role="status" className="catalog-count">
          {notice}
        </p>
      )}
      <DataState
        {...resource}
        retry={resource.refresh}
        empty={!resource.data.length}
      >
        <h2>Belum ada pengguna</h2>
      </DataState>
      {!resource.loading && !resource.error && !!resource.data.length && (
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Tabel pengguna"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Dibuat</th>
                {developer && <th scope="col">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {resource.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.email}
                    {item.id === currentUser.id && <small> (Anda)</small>}
                  </td>
                  <td>
                    <span className="badge">
                      {item.role === "DEVELOPER" ? "Developer" : "Admin"}
                    </span>
                  </td>
                  <td>
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  {developer && (
                    <td>
                      <div className="row-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit pengguna"
                          aria-label={`Edit ${item.email}`}
                          onClick={() => setEditor(item)}
                        >
                          <PenIcon size={18} />
                        </Button>
                        {item.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Hapus pengguna"
                            aria-label={`Hapus ${item.email}`}
                            onClick={() => setDeleting(item)}
                          >
                            <TrashBinTrashIcon size={18} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editor !== undefined && developer && (
        <UserForm
          item={editor}
          currentId={currentUser.id}
          onClose={() => setEditor(undefined)}
          onSaved={saved}
        />
      )}
      {deleting && (
        <ConfirmDelete
          item={deleting}
          endpoint="/api/users"
          onClose={() => setDeleting(null)}
          onDeleted={() => refresh("Pengguna berhasil dihapus.")}
        />
      )}
    </>
  );
}
