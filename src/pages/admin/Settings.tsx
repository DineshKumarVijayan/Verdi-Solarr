import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { SITE_SETTING_KEYS, type SiteSettingKey } from "../../../shared/types";
import { Spinner, useToast } from "../../components/ui";
import { api } from "../../lib/api";
import { useCatalogue } from "../../lib/catalogue";
import { SITE } from "../../site";
import { useAdmin } from "./AdminLayout";
import { canManage, errorText, fieldErrors, PageHead, ReadOnlyNote, send } from "./kit";

const FIELDS: { k: SiteSettingKey; label: string; hint?: string; area?: boolean; placeholder?: string }[] = [
  { k: "announcement", label: "Announcement bar", hint: "Short message shown at the top of every page. Leave empty to hide.", placeholder: "e.g. New stock of TOPCon modules has arrived" },
  { k: "announcementLink", label: "Announcement link", hint: "Optional. A page on this site (e.g. /products) or a full https:// link." },
  { k: "contactPerson", label: "Contact person", placeholder: SITE.contactPerson },
  { k: "phone", label: "Phone number (for calls)", placeholder: "+91 89392 77997" },
  { k: "whatsapp", label: "WhatsApp number", hint: "Enquiries are sent to this number. Leave empty to use the phone number.", placeholder: "+91 89392 77997" },
  { k: "email", label: "Email", placeholder: SITE.email },
  { k: "address", label: "Address (one line per row)", area: true, placeholder: SITE.address.join("\n") },
  { k: "businessHours", label: "Business hours", placeholder: "e.g. Mon–Sat, 9:30 am – 7 pm" },
  { k: "instagramUrl", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { k: "facebookUrl", label: "Facebook", placeholder: "https://www.facebook.com/…" },
  { k: "youtubeUrl", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
  { k: "linkedinUrl", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/…" },
];

export default function Settings() {
  const admin = useAdmin();
  const editable = canManage(admin);
  const toast = useToast();
  const { reload } = useCatalogue();
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/admin/settings").then((r) => {
      setValues(r.settings);
      setSaved(r.settings);
    });
  }, []);

  const save = async () => {
    if (!values) return;
    setBusy(true);
    setErrs({});
    try {
      const changed = Object.fromEntries(SITE_SETTING_KEYS.filter((k) => (values[k] ?? "") !== (saved[k] ?? "")).map((k) => [k, values[k] ?? ""]));
      const r = await send<{ settings: Record<string, string> }>("/api/admin/settings", "PUT", { settings: changed });
      setValues(r.settings);
      setSaved(r.settings);
      reload();
      toast("Settings saved. Live on the website.", "success");
    } catch (e) {
      setErrs(fieldErrors(e));
      toast(errorText(e), "error");
    } finally {
      setBusy(false);
    }
  };

  if (!values)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  const dirty = SITE_SETTING_KEYS.some((k) => (values[k] ?? "") !== (saved[k] ?? ""));

  return (
    <div className="container-x py-10">
      <PageHead
        title="Site settings"
        intro="Contact details, social links and the announcement bar. Empty fields use the built-in default (shown faintly)."
        actions={
          editable && (
            <button type="button" className="btn-primary btn-sm" onClick={save} disabled={busy || !dirty} data-testid="save-settings">
              {busy ? <Spinner className="size-4" /> : <Save className="size-4" />} Save settings
            </button>
          )
        }
      />
      <ReadOnlyNote admin={admin} />
      <div className="card mt-6 grid max-w-3xl gap-4 p-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.k} className={f.area || f.k === "announcement" ? "sm:col-span-2" : ""}>
            <label htmlFor={`st-${f.k}`} className="label">
              {f.label}
            </label>
            {f.area ? (
              <textarea id={`st-${f.k}`} rows={4} className={`field ${errs[f.k] ? "!border-danger" : ""}`} value={values[f.k] ?? ""} placeholder={f.placeholder} disabled={!editable} onChange={(e) => setValues({ ...values, [f.k]: e.target.value })} />
            ) : (
              <input id={`st-${f.k}`} className={`field ${errs[f.k] ? "!border-danger" : ""}`} value={values[f.k] ?? ""} placeholder={f.placeholder} disabled={!editable} onChange={(e) => setValues({ ...values, [f.k]: e.target.value })} />
            )}
            {errs[f.k] ? <p className="mt-1 text-xs text-danger">{errs[f.k]}</p> : f.hint && <p className="mt-1 text-xs text-subtle">{f.hint}</p>}
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-xs text-subtle">Search engines read the business name, phone and address from the built-in defaults at build time. If you change them here, also update src/site.ts at the next release so the structured data matches.</p>
    </div>
  );
}
