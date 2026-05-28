"use client";

import * as React from "react";
import { CreateDrawer } from "@/components/layout/create-drawer";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { SlideToggle } from "@/components/ui/slide-toggle";
import type { SdkCatalogue } from "@/types/admin";
import type { SdkCatalogueInput } from "@/features/sdks/services/sdk-service";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const PLATFORMS = ["web", "mobile", "java", "python", "php", "ios", "android"];
const STATUSES = ["stable", "coming_soon", "deprecated"] as const;

export function SdkFormDrawer({
  open,
  onOpenChange,
  initial,
  onSave,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SdkCatalogue | null;
  onSave: (input: SdkCatalogueInput) => Promise<void>;
  busy?: boolean;
}) {
  const isEdit = Boolean(initial);
  const titleId = isEdit ? "sdk-edit-title" : "sdk-add-title";

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [platform, setPlatform] = React.useState("web");
  const [language, setLanguage] = React.useState("");
  const [packageManager, setPackageManager] = React.useState("");
  const [installCommand, setInstallCommand] = React.useState("");
  const [quickStart, setQuickStart] = React.useState("");
  const [repositoryUrl, setRepositoryUrl] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUSES)[number]>("coming_soon");
  const [featured, setFeatured] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState(0);
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setSlug(initial.slug);
      setSlugTouched(true);
      setPlatform(initial.platform);
      setLanguage(initial.language);
      setPackageManager(initial.package_manager);
      setInstallCommand(initial.install_command);
      setQuickStart(initial.quick_start);
      setRepositoryUrl(initial.repository_url ?? "");
      setStatus(initial.status);
      setFeatured(initial.featured);
      setSortOrder(initial.sort_order);
      setDescription(initial.description ?? "");
    } else {
      setName("");
      setSlug("");
      setSlugTouched(false);
      setPlatform("web");
      setLanguage("");
      setPackageManager("");
      setInstallCommand("");
      setQuickStart("");
      setRepositoryUrl("");
      setStatus("coming_soon");
      setFeatured(false);
      setSortOrder(0);
      setDescription("");
    }
  }, [open, initial]);

  React.useEffect(() => {
    if (!slugTouched && name) setSlug(slugify(name));
  }, [name, slugTouched]);

  function dismiss() {
    if (!busy) onOpenChange(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !name.trim() || !slug.trim()) return;
    await onSave({
      name: name.trim(),
      slug: slug.trim(),
      platform,
      language: language.trim(),
      package_manager: packageManager.trim(),
      install_command: installCommand.trim(),
      quick_start: quickStart.trim(),
      status,
      repository_url: repositoryUrl.trim() || null,
      description: description.trim(),
      featured,
      sort_order: sortOrder,
    });
  }

  return (
    <CreateDrawer
      open={open}
      onClose={dismiss}
      disableBackdropClose={busy}
      disableEscapeClose={busy}
      ariaLabelledBy={titleId}
    >
      <header className="ds-create-drawer__head">
        <span className="ds-create-drawer__head-icon" aria-hidden>
          <MaterialIcon name={isEdit ? "edit" : "inventory_2"} size={22} />
        </span>
        <div className="ds-create-drawer__head-text">
          <h2 id={titleId} className="ds-create-drawer__title">
            {isEdit ? "Edit SDK" : "Add SDK"}
          </h2>
          <p className="ds-create-drawer__subtitle">
            {isEdit
              ? "Update catalogue metadata shown on the developer portal."
              : "Publish a new SDK package with install instructions and portal visibility."}
          </p>
        </div>
        <button type="button" className="ds-create-drawer__close" onClick={dismiss} disabled={busy} aria-label="Close">
          <MaterialIcon name="close" size={18} />
        </button>
      </header>

      <form onSubmit={(e) => void onSubmit(e)} className="ds-create-drawer__form">
        <div className="ds-create-drawer__body">
          <section className="ds-create-drawer__section">
            <h3 className="ds-create-drawer__section-title">
              <MaterialIcon name="badge" size={16} />
              Identity
            </h3>
            <div className="ds-create-drawer__fields">
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-name">
                  Name <span className="ds-create-drawer__required">*</span>
                </label>
                <input
                  id="sdk-name"
                  className="ds-input w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-slug">
                  Slug <span className="ds-create-drawer__required">*</span>
                </label>
                <input
                  id="sdk-slug"
                  className="ds-input w-full font-mono"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  disabled={busy}
                  required
                />
                <p className="ds-create-drawer__hint">Used as the SDK id on the developer portal.</p>
              </div>
              <div className="ds-create-drawer__fields ds-create-drawer__fields--row">
                <div className="ds-field">
                  <label className="ds-field-label" htmlFor="sdk-platform">
                    Platform
                  </label>
                  <select
                    id="sdk-platform"
                    className="ds-select w-full"
                    value={platform}
                    disabled={busy}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ds-field">
                  <label className="ds-field-label" htmlFor="sdk-status">
                    Status
                  </label>
                  <select
                    id="sdk-status"
                    className="ds-select w-full"
                    value={status}
                    disabled={busy}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="ds-create-drawer__section">
            <h3 className="ds-create-drawer__section-title">
              <MaterialIcon name="terminal" size={16} />
              Package
            </h3>
            <div className="ds-create-drawer__fields">
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-language">
                  Language label
                </label>
                <input
                  id="sdk-language"
                  className="ds-input w-full"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. Dart · Flutter"
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-package-manager">
                  Package manager
                </label>
                <input
                  id="sdk-package-manager"
                  className="ds-input w-full"
                  value={packageManager}
                  onChange={(e) => setPackageManager(e.target.value)}
                  disabled={busy}
                  placeholder="npm, pub, pip, gradle…"
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-install">
                  Install command
                </label>
                <textarea
                  id="sdk-install"
                  className="ds-input ds-create-drawer__textarea w-full font-mono"
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-quickstart">
                  Quick start
                </label>
                <textarea
                  id="sdk-quickstart"
                  className="ds-input ds-create-drawer__textarea w-full font-mono"
                  value={quickStart}
                  onChange={(e) => setQuickStart(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-repo">
                  Repository URL
                </label>
                <input
                  id="sdk-repo"
                  className="ds-input w-full"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  disabled={busy}
                  placeholder="https://github.com/…"
                />
              </div>
            </div>
          </section>

          <section className="ds-create-drawer__section">
            <h3 className="ds-create-drawer__section-title">
              <MaterialIcon name="public" size={16} />
              Developer portal
            </h3>
            <div className="ds-create-drawer__fields">
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-sort">
                  Sort order
                </label>
                <input
                  id="sdk-sort"
                  type="number"
                  className="ds-input w-full"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 0)}
                  disabled={busy}
                />
                <p className="ds-create-drawer__hint">Lower numbers appear first on the developer portal SDK page.</p>
              </div>
              <SlideToggle
                id="sdk-featured"
                label="Featured on portal"
                description="Highlight this SDK in the catalogue with a star badge and preferential placement."
                checked={featured}
                disabled={busy}
                onChange={setFeatured}
              />
              <div className="ds-field">
                <label className="ds-field-label" htmlFor="sdk-description">
                  Description
                </label>
                <textarea
                  id="sdk-description"
                  className="ds-input ds-create-drawer__textarea w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
          </section>
        </div>

        <footer className="ds-create-drawer__footer">
          <Button type="button" variant="outline" onClick={dismiss} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" disabled={busy || !name.trim() || !slug.trim()} aria-busy={busy}>
            {busy ? (
              <>
                <MaterialIcon name="hourglass_empty" size={16} />
                Saving…
              </>
            ) : (
              <>
                <MaterialIcon name="save" size={16} />
                {isEdit ? "Save changes" : "Create SDK"}
              </>
            )}
          </Button>
        </footer>
      </form>
    </CreateDrawer>
  );
}
