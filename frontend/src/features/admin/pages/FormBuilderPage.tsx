import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState } from "react";
import {
  Plus,
  GripVertical,
  Eye,
  Copy,
  Trash2,
  Save,
  Send,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Link,
  AlertTriangle,
} from "lucide-react";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multi_select"
  | "checkbox"
  | "radio"
  | "file"
  | "video_url"
  | "demo_url"
  | "github_url"
  | "confirmation";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  key: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  order: number;
}

const fieldTypeConfig: Record<FieldType, { label: string; icon: React.ReactNode; color: string }> = {
  text:         { label: "Matn",          icon: <Type size={16} />,        color: "text-blue-400" },
  textarea:     { label: "Ko'p qatorli",  icon: <AlignLeft size={16} />,   color: "text-cyan-400" },
  number:       { label: "Raqam",         icon: <Hash size={16} />,        color: "text-purple-400" },
  date:         { label: "Sana",          icon: <Calendar size={16} />,    color: "text-amber-400" },
  select:       { label: "Tanlash",       icon: <ChevronDown size={16} />, color: "text-green-400" },
  multi_select: { label: "Ko'p tanlash",  icon: <ChevronDown size={16} />, color: "text-green-400" },
  checkbox:     { label: "Checkbox",      icon: <CheckSquare size={16} />, color: "text-indigo-400" },
  radio:        { label: "Radio",         icon: <Circle size={16} />,      color: "text-pink-400" },
  file:         { label: "Fayl",          icon: <Upload size={16} />,      color: "text-orange-400" },
  video_url:    { label: "Video URL",     icon: <Link size={16} />,        color: "text-red-400" },
  demo_url:     { label: "Demo URL",      icon: <Link size={16} />,        color: "text-teal-400" },
  github_url:   { label: "GitHub URL",    icon: <Link size={16} />,        color: "text-gray-300" },
  confirmation: { label: "Tasdiqlash",    icon: <CheckSquare size={16} />, color: "text-lime-400" },
};

const initialFields: FormField[] = [
  { id: "f1", type: "text",     label: "Loyiha nomi",           key: "project_name",    required: true,  maxLength: 150, order: 1 },
  { id: "f2", type: "textarea", label: "Muammo tavsifi",        key: "problem_desc",    required: true,  maxLength: 1000, order: 2, description: "Qanday muammoni hal qilasiz?" },
  { id: "f3", type: "textarea", label: "Yechim tavsifi",        key: "solution_desc",   required: true,  maxLength: 1000, order: 3 },
  { id: "f4", type: "select",   label: "Yo'nalish",             key: "direction",       required: true,  order: 4 },
  { id: "f5", type: "select",   label: "Ishtirok turi",         key: "participation",   required: true,  order: 5 },
  { id: "f6", type: "file",     label: "Taqdimot (PDF/PPTX)",   key: "presentation",    required: true,  order: 6 },
  { id: "f7", type: "video_url",label: "Video taqdimot URL",    key: "video_url",       required: false, order: 7 },
  { id: "f8", type: "demo_url", label: "Demo havolasi",         key: "demo_url",        required: false, order: 8 },
  { id: "f9", type: "github_url",label:"GitHub havolasi",       key: "github_url",      required: false, order: 9 },
  { id:"f10", type: "checkbox", label: "MVP mavjudligi",        key: "has_mvp",         required: false, order: 10 },
  { id:"f11", type: "confirmation", label: "Nizomni qabul qildim", key: "terms",        required: true,  order: 11 },
];

export function FormBuilderPage() {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: fieldTypeConfig[type].label,
      key: `field_${Date.now()}`,
      required: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  const duplicateField = (field: FormField) => {
    const copy: FormField = {
      ...field,
      id: `f_${Date.now()}`,
      key: `${field.key}_copy`,
      order: fields.length + 1,
    };
    setFields([...fields, copy]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFields(updated);
    if (selectedField?.id === id) setSelectedField({ ...selectedField, ...updates });
  };

  const handlePublish = () => {
    if (isPublished) {
      alert("Eslatma: Ariza qabuli ochilgandan keyin muhim maydonlarni o'zgartirish audit jurnaliga yoziladi.");
    }
    setIsPublished(true);
    alert("Ariza shakli e'lon qilindi! (Demo)");
  };

  return (
    <AdminShell>
      <AdminPageHeader
        title="Ariza shakli"
        subtitle="Ishtirokchilar uchun ariza formasini sozlash"
        actions={
          <>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => alert("Qoralama saqlandi! (Demo)")}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm"
            >
              <Save size={16} />
              <span>Saqlash</span>
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Send size={16} />
              <span>{isPublished ? "Qayta e'lon" : "E'lon qilish"}</span>
            </button>
          </>
        }
      />

      {isPublished && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-400">
            <strong>Diqqat:</strong> Ariza shakli e'lon qilingan. Muhim maydonlarni o'zgartirish audit jurnaliga yoziladi va ishtirokchilar xabardor qilinadi.
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Field Types Panel */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 sticky top-24">
            <h3 className="text-sm font-bold text-white mb-4">Maydon turlari</h3>
            <div className="space-y-1">
              {(Object.keys(fieldTypeConfig) as FieldType[]).map((type) => {
                const cfg = fieldTypeConfig[type];
                return (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--admin-bg)] transition-colors text-left"
                  >
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span className="text-sm text-[var(--admin-text-secondary)] hover:text-white transition-colors">
                      {cfg.label}
                    </span>
                    <Plus size={14} className="ml-auto text-[var(--admin-text-muted)]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      {/* Fields List */}
        <div className="lg:col-span-5">
          <div className="space-y-3 min-h-[300px]">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field) => {
                const cfg = fieldTypeConfig[field.type];
                const isSelected = selectedField?.id === field.id;
                return (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    className={`bg-[var(--admin-surface)] border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected ? "border-blue-500/60 shadow-[0_0_16px_rgba(47,125,246,0.2)]" : "border-[var(--admin-border)] hover:border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-[var(--admin-text-muted)] cursor-move" title="Tartibni o'zgartirish">
                        <GripVertical size={18} />
                      </button>
                      <span className={cfg.color}>{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{field.label}</div>
                        <div className="text-xs text-[var(--admin-text-muted)] flex items-center gap-2 mt-0.5">
                          <span className={cfg.color}>{cfg.label}</span>
                          <span>·</span>
                          <span className="font-mono">{field.key}</span>
                          {field.required && (
                            <>
                              <span>·</span>
                              <span className="text-red-400">Majburiy</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateField(field); }}
                          className="p-1.5 hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
                          title="Nusxalash"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                          className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {fields.length === 0 && (
              <div className="py-16 text-center bg-[var(--admin-surface)] border-2 border-dashed border-[var(--admin-border)] rounded-xl">
                <Plus size={40} className="mx-auto mb-3 text-[var(--admin-text-muted)] opacity-50" />
                <p className="text-[var(--admin-text-muted)]">Chap paneldan maydon qo'shing</p>
              </div>
            )}
          </div>
        </div>

        {/* Field Properties Panel */}
        <div className="lg:col-span-4">
          {selectedField ? (
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 sticky top-24">
              <h3 className="text-sm font-bold text-white mb-5">Maydon sozlamalari</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1.5">Label</label>
                  <input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1.5">Key (kalit)</label>
                  <input
                    value={selectedField.key}
                    onChange={(e) => updateField(selectedField.id, { key: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1.5">Tavsif (ixtiyoriy)</label>
                  <input
                    value={selectedField.description || ""}
                    onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                    placeholder="Qo'shimcha izoh..."
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1.5">Placeholder</label>
                  <input
                    value={selectedField.placeholder || ""}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                    placeholder="Misol matni..."
                    className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                {(selectedField.type === "text" || selectedField.type === "textarea") && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1.5">Maksimal uzunlik</label>
                    <input
                      type="number"
                      value={selectedField.maxLength || ""}
                      onChange={(e) => updateField(selectedField.id, { maxLength: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-t border-[var(--admin-border)]">
                  <div>
                    <div className="text-sm font-medium text-white">Majburiy maydon</div>
                    <div className="text-xs text-[var(--admin-text-muted)]">To'ldirish shart bo'ladi</div>
                  </div>
                  <button
                    onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${selectedField.required ? "bg-blue-500" : "bg-gray-600"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${selectedField.required ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 text-center">
              <div className="py-8 text-[var(--admin-text-muted)]">
                <Eye size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Maydon xususiyatlarini ko'rish uchun tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
