import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Baby, ChevronRight, Database, Eye, ExternalLink, FileText, Pencil, Plus, Search, School, ShieldCheck, Trash2, UploadCloud, UsersRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/api';
import { useChildren } from '../../features/children/hooks/useChildren';
import { useStaff } from '../../features/staff/hooks/useStaff';
import { Pagination } from '../ui/Pagination';

const CHILDREN_PAGE_SIZE = 15;
const STAFF_PAGE_SIZE = 15;

type KindergartenArchiveDocument = {
  id: string;
  document_name: string;
  file_url: string;
  file_exists?: boolean;
  file_name?: string | null;
  mime_type?: string | null;
  created_at?: string;
};

type ChildArchiveDocument = {
  id: string;
  child_id: string;
  category: string;
  document_name: string;
  file_url: string;
  file_exists?: boolean;
  text_value?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  created_at?: string;
  source?: 'manual' | 'parent_portal' | 'profile_data';
  readonly?: boolean;
};

type StaffArchiveDocument = {
  id: string;
  staff_id: string;
  category: string;
  document_name: string;
  file_url: string;
  file_exists?: boolean;
  text_value?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  created_at?: string;
  source?: 'manual' | 'profile_data';
  readonly?: boolean;
};

type ArchivePreviewDocument = {
  document_name: string;
  category: string;
  file_url: string;
  file_exists?: boolean;
  text_value?: string | null;
  file_name?: string | null;
  source?: string;
};

const childDocumentCategories = [
  { value: 'FATHER_PASSPORT', label: 'Otasining passporti' },
  { value: 'MOTHER_PASSPORT', label: 'Onasining passporti' },
  { value: 'BIRTH_CERTIFICATE', label: "Tug'ilganlik guvohnomasi" },
  { value: 'MEDICAL', label: 'Kasallik va allergiya' },
  { value: 'OTHER', label: 'Boshqa dokumentlar' },
];

const staffDocumentCategories = [
  { value: 'PASSPORT', label: 'Passporti' },
  { value: 'OTHER', label: 'Boshqa hujjatlar' },
];

const archiveCards = [
  {
    title: "Bolalarning ma'lumotlari",
    description: "Bolalarning shaxsiy, guruh va ota-ona ma'lumotlarini kiritish, tartiblash hamda xavfsiz saqlash bo'limi.",
    icon: Baby,
    metaIcon: FileText,
    tone: 'from-sky-50 via-white to-blue-100 text-blue-700 border-blue-100/90',
    accent: 'from-blue-600 via-sky-500 to-cyan-400',
    label: "Bolalar arxivi",
    code: '01',
  },
  {
    title: "Xodimlarning ma'lumotlari",
    description: "Tarbiyachi, hamshira, oshpaz va boshqa xodimlarning lavozim, aloqa va hujjat yozuvlarini saqlash bo'limi.",
    icon: UsersRound,
    metaIcon: ShieldCheck,
    tone: 'from-emerald-50 via-white to-teal-100 text-emerald-700 border-emerald-100/90',
    accent: 'from-emerald-600 via-teal-500 to-cyan-400',
    label: "Xodimlar arxivi",
    code: '02',
  },
  {
    title: "Bog'cha ma'lumotlari",
    description: "MTT rekvizitlari, litsenziya, manzil, quvvat va boshqaruv ma'lumotlarini yagona joyda saqlash bo'limi.",
    icon: School,
    metaIcon: Database,
    tone: 'from-violet-50 via-white to-indigo-100 text-violet-700 border-violet-100/90',
    accent: 'from-violet-600 via-indigo-500 to-blue-400',
    label: "MTT arxivi",
    code: '03',
  },
];

const ArchiveView: React.FC = () => {
  const { children, loading: childrenLoading } = useChildren();
  const { staff, loading: staffLoading } = useStaff();
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  const [activeMenu, setActiveMenu] = useState<'overview' | 'children' | 'childProfile' | 'staff' | 'staffProfile' | 'kindergarten'>('overview');
  const [childSearch, setChildSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [childrenPage, setChildrenPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [childDocuments, setChildDocuments] = useState<ChildArchiveDocument[]>([]);
  const [childDocumentsLoading, setChildDocumentsLoading] = useState(false);
  const [isChildDocumentModalOpen, setIsChildDocumentModalOpen] = useState(false);
  const [editingChildDocument, setEditingChildDocument] = useState<ChildArchiveDocument | null>(null);
  const [deleteChildDocument, setDeleteChildDocument] = useState<ChildArchiveDocument | null>(null);
  const [childDocumentName, setChildDocumentName] = useState('');
  const [childDocumentCategory, setChildDocumentCategory] = useState(childDocumentCategories[0].value);
  const [childDocumentFile, setChildDocumentFile] = useState<File | null>(null);
  const [isSavingChildDocument, setIsSavingChildDocument] = useState(false);
  const [isDeletingChildDocument, setIsDeletingChildDocument] = useState(false);
  const [childDocumentError, setChildDocumentError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [staffDocuments, setStaffDocuments] = useState<StaffArchiveDocument[]>([]);
  const [staffDocumentsLoading, setStaffDocumentsLoading] = useState(false);
  const [isStaffDocumentModalOpen, setIsStaffDocumentModalOpen] = useState(false);
  const [editingStaffDocument, setEditingStaffDocument] = useState<StaffArchiveDocument | null>(null);
  const [deleteStaffDocument, setDeleteStaffDocument] = useState<StaffArchiveDocument | null>(null);
  const [staffDocumentName, setStaffDocumentName] = useState('');
  const [staffDocumentCategory, setStaffDocumentCategory] = useState(staffDocumentCategories[0].value);
  const [staffDocumentFile, setStaffDocumentFile] = useState<File | null>(null);
  const [isSavingStaffDocument, setIsSavingStaffDocument] = useState(false);
  const [isDeletingStaffDocument, setIsDeletingStaffDocument] = useState(false);
  const [staffDocumentError, setStaffDocumentError] = useState('');
  const [kindergartenDocuments, setKindergartenDocuments] = useState<KindergartenArchiveDocument[]>([]);
  const [kindergartenDocsLoading, setKindergartenDocsLoading] = useState(false);
  const [isKindergartenModalOpen, setIsKindergartenModalOpen] = useState(false);
  const [editingKindergartenDocument, setEditingKindergartenDocument] = useState<KindergartenArchiveDocument | null>(null);
  const [deleteKindergartenDocument, setDeleteKindergartenDocument] = useState<KindergartenArchiveDocument | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [previewDocument, setPreviewDocument] = useState<ArchivePreviewDocument | null>(null);

  const filteredChildren = useMemo(() => {
    const query = childSearch.trim().toLowerCase();
    if (!query) return children;

    return children.filter((child: any) => {
      const fatherName = child.father_name || child.father?.full_name || '';
      const motherName = child.mother_name || child.mother?.full_name || '';
      const searchText = [
        child.first_name,
        child.last_name,
        child.birth_certificate_number,
        child.passport_info,
        child.group_name,
        child.group_teacher,
        fatherName,
        motherName,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchText.includes(query);
    });
  }, [childSearch, children]);

  const visibleChildren = useMemo(() => {
    const start = (childrenPage - 1) * CHILDREN_PAGE_SIZE;
    return filteredChildren.slice(start, start + CHILDREN_PAGE_SIZE);
  }, [childrenPage, filteredChildren]);

  const totalChildrenPages = Math.max(1, Math.ceil(filteredChildren.length / CHILDREN_PAGE_SIZE));

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return staff;

    return staff.filter((member: any) => {
      const searchText = [
        member.full_name,
        member.position,
        member.phone,
        member.email,
        member.passport_no,
        member.group_name,
        member.status,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchText.includes(query);
    });
  }, [staff, staffSearch]);

  const visibleStaff = useMemo(() => {
    const start = (staffPage - 1) * STAFF_PAGE_SIZE;
    return filteredStaff.slice(start, start + STAFF_PAGE_SIZE);
  }, [filteredStaff, staffPage]);

  const totalStaffPages = Math.max(1, Math.ceil(filteredStaff.length / STAFF_PAGE_SIZE));

  useEffect(() => {
    setChildrenPage(1);
  }, [childSearch]);

  useEffect(() => {
    setStaffPage(1);
  }, [staffSearch]);

  useEffect(() => {
    if (childrenPage > totalChildrenPages) setChildrenPage(totalChildrenPages);
  }, [childrenPage, totalChildrenPages]);

  useEffect(() => {
    if (staffPage > totalStaffPages) setStaffPage(totalStaffPages);
  }, [staffPage, totalStaffPages]);

  const fetchKindergartenDocuments = async () => {
    try {
      setKindergartenDocsLoading(true);
      const res = await apiClient.get('/archive/kindergarten-documents');
      setKindergartenDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Kindergarten archive documents failed:', error);
      setKindergartenDocuments([]);
    } finally {
      setKindergartenDocsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'kindergarten') fetchKindergartenDocuments();
  }, [activeMenu]);

  const fetchChildDocuments = async (childId: string) => {
    try {
      setChildDocumentsLoading(true);
      const res = await apiClient.get(`/archive/children/${childId}/documents`);
      setChildDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Child archive documents failed:', error);
      setChildDocuments([]);
    } finally {
      setChildDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'childProfile' && selectedChild?.id) {
      fetchChildDocuments(selectedChild.id);
    }
  }, [activeMenu, selectedChild?.id]);

  const getChildFullName = (child: any) => `${child?.first_name || ''} ${child?.last_name || ''}`.trim() || 'Ism kiritilmagan';

  const openChildProfile = (child: any) => {
    setSelectedChild(child);
    setActiveMenu('childProfile');
  };

  const fetchStaffDocuments = async (staffId: string) => {
    try {
      setStaffDocumentsLoading(true);
      const res = await apiClient.get(`/archive/staff/${staffId}/documents`);
      setStaffDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Staff archive documents failed:', error);
      setStaffDocuments([]);
    } finally {
      setStaffDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'staffProfile' && selectedStaff?.id) {
      fetchStaffDocuments(selectedStaff.id);
    }
  }, [activeMenu, selectedStaff?.id]);

  const openStaffProfile = (member: any) => {
    setSelectedStaff(member);
    setActiveMenu('staffProfile');
  };

  const openChildDocumentCreate = (category = childDocumentCategories[0].value) => {
    setEditingChildDocument(null);
    setChildDocumentName('');
    setChildDocumentCategory(category);
    setChildDocumentFile(null);
    setChildDocumentError('');
    setIsChildDocumentModalOpen(true);
  };

  const openChildDocumentEdit = (document: ChildArchiveDocument) => {
    setEditingChildDocument(document);
    setChildDocumentName(document.document_name);
    setChildDocumentCategory(document.category);
    setChildDocumentFile(null);
    setChildDocumentError('');
    setIsChildDocumentModalOpen(true);
  };

  const closeChildDocumentModal = () => {
    setIsChildDocumentModalOpen(false);
    setEditingChildDocument(null);
    setChildDocumentName('');
    setChildDocumentCategory(childDocumentCategories[0].value);
    setChildDocumentFile(null);
    setChildDocumentError('');
  };

  const openStaffDocumentCreate = (category = staffDocumentCategories[0].value) => {
    setEditingStaffDocument(null);
    setStaffDocumentName('');
    setStaffDocumentCategory(category);
    setStaffDocumentFile(null);
    setStaffDocumentError('');
    setIsStaffDocumentModalOpen(true);
  };

  const openStaffDocumentEdit = (document: StaffArchiveDocument) => {
    setEditingStaffDocument(document);
    setStaffDocumentName(document.document_name);
    setStaffDocumentCategory(document.category);
    setStaffDocumentFile(null);
    setStaffDocumentError('');
    setIsStaffDocumentModalOpen(true);
  };

  const closeStaffDocumentModal = () => {
    setIsStaffDocumentModalOpen(false);
    setEditingStaffDocument(null);
    setStaffDocumentName('');
    setStaffDocumentCategory(staffDocumentCategories[0].value);
    setStaffDocumentFile(null);
    setStaffDocumentError('');
  };

  const openKindergartenDocumentCreate = () => {
    setEditingKindergartenDocument(null);
    setDocumentName('');
    setDocumentFile(null);
    setDocumentError('');
    setIsKindergartenModalOpen(true);
  };

  const openKindergartenDocumentEdit = (document: KindergartenArchiveDocument) => {
    setEditingKindergartenDocument(document);
    setDocumentName(document.document_name);
    setDocumentFile(null);
    setDocumentError('');
    setIsKindergartenModalOpen(true);
  };

  const closeKindergartenModal = () => {
    setIsKindergartenModalOpen(false);
    setEditingKindergartenDocument(null);
    setDocumentName('');
    setDocumentFile(null);
    setDocumentError('');
  };

  const handleKindergartenDocumentSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = documentName.trim();

    if (!name) {
      setDocumentError('Dokument nomi kiritilishi shart');
      return;
    }
    if (!editingKindergartenDocument && !documentFile) {
      setDocumentError('PDF yoki Word hujjat yuklanishi shart');
      return;
    }
    if (documentFile) {
      const lowerFileName = documentFile.name.toLowerCase();
      const isAllowedDocument =
        lowerFileName.endsWith('.pdf') ||
        lowerFileName.endsWith('.doc') ||
        lowerFileName.endsWith('.docx');
      if (!isAllowedDocument) {
        setDocumentError('Faqat PDF yoki Word hujjat yuklash mumkin');
        return;
      }
    }

    try {
      setIsSavingDocument(true);
      setDocumentError('');
      const payload = {
        document_name: name,
        file_url: editingKindergartenDocument?.file_url || '',
        file_name: editingKindergartenDocument?.file_name || null,
        mime_type: editingKindergartenDocument?.mime_type || null,
      };

      if (documentFile) {
        const formData = new FormData();
        formData.append('image', documentFile);
        formData.append('bucket', 'system-assets');

        const uploadRes = await apiClient.post('/upload/system-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        payload.file_url = uploadRes.data.url;
        payload.file_name = documentFile.name;
        payload.mime_type = documentFile.type;
      }

      if (editingKindergartenDocument) {
        const saveRes = await apiClient.put(`/archive/kindergarten-documents/${editingKindergartenDocument.id}`, payload);
        setKindergartenDocuments((items) =>
          items.map((item) => item.id === editingKindergartenDocument.id ? saveRes.data : item)
        );
      } else {
        const saveRes = await apiClient.post('/archive/kindergarten-documents', payload);
        setKindergartenDocuments((items) => [saveRes.data, ...items]);
      }
      toast.success(documentFile ? 'Yuklangan hujjat yuklandi' : "Hujjat ma'lumotlari saqlandi");
      closeKindergartenModal();
    } catch (error: any) {
      setDocumentError(error?.response?.data?.error || 'Hujjatni saqlashda xatolik yuz berdi');
    } finally {
      setIsSavingDocument(false);
    }
  };

  const getKindergartenDocumentUrl = (fileUrl: string) => {
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return `${apiRoot}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
  };

  const getArchiveFileUrl = getKindergartenDocumentUrl;

  const isAllowedArchiveFile = (file: File) => {
    const lowerFileName = file.name.toLowerCase();
    return (
      lowerFileName.endsWith('.pdf') ||
      lowerFileName.endsWith('.doc') ||
      lowerFileName.endsWith('.docx') ||
      lowerFileName.endsWith('.jpg') ||
      lowerFileName.endsWith('.jpeg') ||
      lowerFileName.endsWith('.png')
    );
  };

  const handleChildDocumentSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedChild?.id) return;
    const selectedCategory = childDocumentCategories.find((category) => category.value === childDocumentCategory);
    const requiresDocumentName = childDocumentCategory === 'OTHER';
    const name = requiresDocumentName ? childDocumentName.trim() : (selectedCategory?.label || '').trim();

    if (requiresDocumentName && !name) {
      setChildDocumentError('Dokument nomi kiritilishi shart');
      return;
    }
    if (!childDocumentCategory) {
      setChildDocumentError('Hujjat turi tanlanishi shart');
      return;
    }
    if (!editingChildDocument && !childDocumentFile) {
      setChildDocumentError('Hujjat fayli yuklanishi shart');
      return;
    }
    if (childDocumentFile && !isAllowedArchiveFile(childDocumentFile)) {
      setChildDocumentError('PDF, Word yoki rasm fayl yuklash mumkin');
      return;
    }

    try {
      setIsSavingChildDocument(true);
      setChildDocumentError('');
      const payload = {
        category: childDocumentCategory,
        document_name: name,
        file_url: editingChildDocument?.file_url || '',
        file_name: editingChildDocument?.file_name || null,
        mime_type: editingChildDocument?.mime_type || null,
      };

      if (childDocumentFile) {
        const formData = new FormData();
        formData.append('image', childDocumentFile);
        formData.append('bucket', 'system-assets');
        const uploadRes = await apiClient.post('/upload/system-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        payload.file_url = uploadRes.data.url;
        payload.file_name = childDocumentFile.name;
        payload.mime_type = childDocumentFile.type;
      }

      if (editingChildDocument?.readonly) {
        const saveRes = await apiClient.post(`/archive/children/${selectedChild.id}/documents`, payload);
        await apiClient.delete(`/archive/children/${selectedChild.id}/documents/${editingChildDocument.id}`).catch(() => null);
        setChildDocuments((items) => [saveRes.data, ...items.filter((item) => item.id !== editingChildDocument.id)]);
      } else if (editingChildDocument) {
        const saveRes = await apiClient.put(`/archive/children/${selectedChild.id}/documents/${editingChildDocument.id}`, payload);
        setChildDocuments((items) => items.map((item) => item.id === editingChildDocument.id ? saveRes.data : item));
      } else {
        const saveRes = await apiClient.post(`/archive/children/${selectedChild.id}/documents`, payload);
        setChildDocuments((items) => [saveRes.data, ...items]);
      }
      toast.success(childDocumentFile ? 'Yuklangan hujjat yuklandi' : "Hujjat ma'lumotlari saqlandi");
      closeChildDocumentModal();
    } catch (error: any) {
      setChildDocumentError(error?.response?.data?.error || 'Hujjatni saqlashda xatolik yuz berdi');
    } finally {
      setIsSavingChildDocument(false);
    }
  };

  const handleStaffDocumentSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStaff?.id) return;
    const selectedCategory = staffDocumentCategories.find((category) => category.value === staffDocumentCategory);
    const requiresDocumentName = staffDocumentCategory === 'OTHER';
    const name = requiresDocumentName ? staffDocumentName.trim() : (selectedCategory?.label || '').trim();

    if (!staffDocumentCategory) {
      setStaffDocumentError('Hujjat turi tanlanishi shart');
      return;
    }
    if (requiresDocumentName && !name) {
      setStaffDocumentError('Dokument nomi kiritilishi shart');
      return;
    }
    if (!editingStaffDocument && !staffDocumentFile) {
      setStaffDocumentError('Hujjat fayli yuklanishi shart');
      return;
    }
    if (staffDocumentFile && !isAllowedArchiveFile(staffDocumentFile)) {
      setStaffDocumentError('PDF, Word yoki rasm fayl yuklash mumkin');
      return;
    }

    try {
      setIsSavingStaffDocument(true);
      setStaffDocumentError('');
      const payload = {
        category: staffDocumentCategory,
        document_name: name,
        file_url: editingStaffDocument?.file_url || '',
        file_name: editingStaffDocument?.file_name || null,
        mime_type: editingStaffDocument?.mime_type || null,
      };

      if (staffDocumentFile) {
        const formData = new FormData();
        formData.append('image', staffDocumentFile);
        formData.append('bucket', 'system-assets');
        const uploadRes = await apiClient.post('/upload/system-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        payload.file_url = uploadRes.data.url;
        payload.file_name = staffDocumentFile.name;
        payload.mime_type = staffDocumentFile.type;
      }

      if (editingStaffDocument?.readonly) {
        const saveRes = await apiClient.post(`/archive/staff/${selectedStaff.id}/documents`, payload);
        await apiClient.delete(`/archive/staff/${selectedStaff.id}/documents/${editingStaffDocument.id}`).catch(() => null);
        setStaffDocuments((items) => [saveRes.data, ...items.filter((item) => item.id !== editingStaffDocument.id)]);
      } else if (editingStaffDocument) {
        const saveRes = await apiClient.put(`/archive/staff/${selectedStaff.id}/documents/${editingStaffDocument.id}`, payload);
        setStaffDocuments((items) => items.map((item) => item.id === editingStaffDocument.id ? saveRes.data : item));
      } else {
        const saveRes = await apiClient.post(`/archive/staff/${selectedStaff.id}/documents`, payload);
        setStaffDocuments((items) => [saveRes.data, ...items]);
      }
      toast.success(staffDocumentFile ? 'Yuklangan hujjat yuklandi' : "Hujjat ma'lumotlari saqlandi");
      closeStaffDocumentModal();
    } catch (error: any) {
      setStaffDocumentError(error?.response?.data?.error || 'Hujjatni saqlashda xatolik yuz berdi');
    } finally {
      setIsSavingStaffDocument(false);
    }
  };

  const confirmChildDocumentDelete = async () => {
    if (!selectedChild?.id || !deleteChildDocument) return;
    try {
      setIsDeletingChildDocument(true);
      await apiClient.delete(`/archive/children/${selectedChild.id}/documents/${deleteChildDocument.id}`);
      setChildDocuments((items) => items.filter((item) => item.id !== deleteChildDocument.id));
      setDeleteChildDocument(null);
      toast.success("Hujjat o'chirildi");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Hujjatni o'chirishda xatolik yuz berdi");
    } finally {
      setIsDeletingChildDocument(false);
    }
  };

  const confirmStaffDocumentDelete = async () => {
    if (!selectedStaff?.id || !deleteStaffDocument) return;
    try {
      setIsDeletingStaffDocument(true);
      await apiClient.delete(`/archive/staff/${selectedStaff.id}/documents/${deleteStaffDocument.id}`);
      setStaffDocuments((items) => items.filter((item) => item.id !== deleteStaffDocument.id));
      setDeleteStaffDocument(null);
      toast.success("Hujjat o'chirildi");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Hujjatni o'chirishda xatolik yuz berdi");
    } finally {
      setIsDeletingStaffDocument(false);
    }
  };

  const confirmKindergartenDocumentDelete = async () => {
    if (!deleteKindergartenDocument) return;
    try {
      setIsDeletingDocument(true);
      await apiClient.delete(`/archive/kindergarten-documents/${deleteKindergartenDocument.id}`);
      setKindergartenDocuments((items) => items.filter((item) => item.id !== deleteKindergartenDocument.id));
      setDeleteKindergartenDocument(null);
      toast.success("Hujjat o'chirildi");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Hujjatni o'chirishda xatolik yuz berdi");
    } finally {
      setIsDeletingDocument(false);
    }
  };

  const renderPreviewDocumentModal = () => {
    if (!previewDocument) return null;
    const previewCategoryLabel =
      childDocumentCategories.find((item) => item.value === previewDocument.category)?.label ||
      staffDocumentCategories.find((item) => item.value === previewDocument.category)?.label ||
      previewDocument.category;

    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-violet-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]" style={{ borderRadius: 1 }}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-violet-700">Hujjatni ko'rish</p>
              <h3 className="mt-1 text-xl font-black text-brand-depth">{previewDocument.document_name}</h3>
            </div>
            <button type="button" onClick={() => setPreviewDocument(null)} className="inline-flex h-9 w-9 items-center justify-center rounded-[1px] border border-slate-200 bg-white text-brand-muted hover:text-brand-depth">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 text-sm font-bold text-brand-slate">
            <div className="rounded-[1px] border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-black uppercase text-brand-muted">Hujjat turi</p>
              <p className="mt-1 text-brand-depth">{previewCategoryLabel}</p>
            </div>
            <div className="rounded-[1px] border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-black uppercase text-brand-muted">Ma'lumot</p>
              <p className="mt-1 text-brand-depth">{previewDocument.text_value || previewDocument.file_name || 'Fayl hali yuklanmagan'}</p>
            </div>
            {previewDocument.file_url && previewDocument.file_exists !== false ? (
              <a href={getArchiveFileUrl(previewDocument.file_url)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-[1px] border border-violet-200 bg-violet-600 px-4 text-sm font-black text-white">
                <ExternalLink size={16} />
                Faylni ochish
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (activeMenu === 'childProfile' && selectedChild) {
    const fullName = getChildFullName(selectedChild);
    const fatherName = selectedChild.father_name || selectedChild.father?.full_name || '-';
    const motherName = selectedChild.mother_name || selectedChild.mother?.full_name || '-';

    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1px] border border-blue-100 bg-white/[0.96] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.09)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />
          <button
            onClick={() => setActiveMenu('children')}
            className="mb-5 inline-flex items-center gap-2 rounded-[1px] border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase text-brand-muted shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            <ChevronRight size={14} className="rotate-180" />
            Bolalar ro'yxatiga qaytish
          </button>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[1px] border border-blue-100 bg-gradient-to-br from-sky-50 via-white to-blue-100 text-blue-700 shadow-[0_18px_34px_rgba(37,99,235,0.12)]">
                <Baby size={25} />
              </div>
              <p className="mb-2 text-[10px] font-black uppercase text-blue-700">Bola profili arxivi</p>
              <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">{fullName}</h1>
              <p className="mt-4 max-w-3xl text-sm font-black leading-6 text-rose-600">
                Bolaning shaxsiy hujjatlari faqat ichki nazorat uchun saqlanadi, ruxsatsiz tarqatish qat'iyan man qilinadi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1px] border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-[10px] font-black uppercase text-brand-muted">Guruh</p>
                <p className="mt-1 text-sm font-black text-brand-depth">{selectedChild.group_name || 'Guruhsiz'}</p>
              </div>
              <div className="rounded-[1px] border border-blue-100 bg-white p-4">
                <p className="text-[10px] font-black uppercase text-brand-muted">Hujjatlar</p>
                <p className="mt-1 text-sm font-black text-blue-700">{childDocuments.length} ta saqlangan</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ['Otasi', fatherName, selectedChild.father_passport || selectedChild.father?.passport_no || 'Passport kiritilmagan'],
            ['Onasi', motherName, selectedChild.mother_passport || selectedChild.mother?.passport_no || 'Passport kiritilmagan'],
            ['Bola hujjati', selectedChild.birth_certificate_number || selectedChild.passport_info || 'Hujjat kiritilmagan', selectedChild.medical_notes || selectedChild.allergies || 'Tibbiy qayd kiritilmagan'],
          ].map(([title, value, note]) => (
            <div key={title} className="rounded-[1px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <p className="text-[10px] font-black uppercase text-brand-muted">{title}</p>
              <h3 className="mt-2 text-base font-black text-brand-depth">{value}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-brand-slate">{note}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[1px] border border-sky-100 bg-white/[0.94] shadow-[0_22px_58px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-white via-sky-50/70 to-blue-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-brand-muted">Sub-menu</p>
              <h2 className="text-lg font-black text-brand-depth">Bolaning hujjatlar arxivi</h2>
            </div>
            <button
              onClick={() => openChildDocumentCreate()}
              className="group inline-flex h-12 items-center justify-center overflow-hidden rounded-[1px] border border-blue-300/80 bg-blue-700 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_42px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              <span className="flex h-full w-12 items-center justify-center border-r border-white/22 bg-white/10">
                <Plus size={18} />
              </span>
              <span className="px-5">Hujjat kiritish</span>
            </button>
          </div>

          {childDocumentsLoading ? (
            <div className="p-10 text-center text-sm font-black text-brand-muted">Hujjatlar yuklanmoqda...</div>
          ) : childDocuments.length === 0 ? (
            <div className="p-8">
              <h3 className="text-xl font-black text-brand-depth">Hali hujjatlar kiritilmagan</h3>
              <p className="mt-2 text-sm font-bold text-brand-slate">Bola profili uchun ota-ona, passport, guvohnoma yoki tibbiy hujjatlarni yuklang.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {childDocuments.map((document) => {
                const category = childDocumentCategories.find((item) => item.value === document.category);
                const sourceLabel =
                  document.source === 'parent_portal'
                    ? 'Ota-ona portalidan'
                    : document.source === 'profile_data'
                      ? "Bola profilidan"
                      : "Qo'lda yuklangan";
                const isUploaded = Boolean(document.file_url && document.file_exists !== false);
                return (
                  <article key={document.id} className="grid gap-4 px-5 py-4 hover:bg-sky-50/45 sm:px-6 lg:grid-cols-[3rem_1fr_0.9fr_8rem_16rem] lg:items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1px] bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-depth">{document.document_name}</h3>
                      <p className="mt-1 text-xs font-bold text-brand-muted">
                        {document.text_value || document.file_name || 'Hujjat fayli'}
                      </p>
                      <span className="mt-2 inline-flex rounded-[1px] border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-black uppercase text-blue-700">
                        {sourceLabel}
                      </span>
                    </div>
                    <p className="text-xs font-black text-blue-700">{category?.label || document.category}</p>
                    <p className="text-xs font-bold text-brand-muted">{document.created_at?.split('T')[0]?.split(' ')[0] || '-'}</p>
                    <div className="inline-flex w-fit items-center gap-1 rounded-[1px] border border-slate-200/90 bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.08)] lg:justify-self-end">
                      <span className={`px-3 text-[10px] font-black uppercase ${isUploaded ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isUploaded ? 'Yuklangan' : 'Yuklanmagan'}
                      </span>
                      {document.file_url && document.file_exists !== false ? (
                        <a href={getArchiveFileUrl(document.file_url)} target="_blank" rel="noreferrer" aria-label="Hujjatni ko'rish" title="Hujjatni ko'rish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-violet-50 text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white">
                          <Eye size={14} />
                        </a>
                      ) : (
                        <button type="button" onClick={() => setPreviewDocument(document)} aria-label="Hujjatni ko'rish" title="Hujjatni ko'rish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-violet-50 text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white">
                          <Eye size={14} />
                        </button>
                      )}
                      <button type="button" onClick={() => openChildDocumentEdit(document)} aria-label="Hujjatni tahrirlash" title="Hujjatni tahrirlash" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-blue-200/90 bg-blue-50 text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteChildDocument(document)} aria-label="Hujjatni o'chirish" title="Hujjatni o'chirish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-rose-200/90 bg-rose-50 text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {isChildDocumentModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <form onSubmit={handleChildDocumentSave} className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]" style={{ borderRadius: 1 }}>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-brand-depth">{editingChildDocument ? 'Bola hujjatini tahrirlash' : 'Bola hujjatini kiriting'}</h3>
                  <p className="mt-1 text-sm font-bold text-brand-muted">
                    Hujjat turini tanlang va tegishli faylni yuklang.
                  </p>
                </div>
                <button type="button" onClick={closeChildDocumentModal} className="p-2 text-brand-muted hover:text-brand-depth">
                  <X size={20} />
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase text-brand-muted">Hujjat turi</span>
                <select value={childDocumentCategory} onChange={(event) => setChildDocumentCategory(event.target.value)} className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-400" style={{ borderRadius: 1 }}>
                  {childDocumentCategories.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </label>

              {childDocumentCategory === 'OTHER' && (
                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase text-brand-muted">Dokument nomi</span>
                  <input value={childDocumentName} onChange={(event) => setChildDocumentName(event.target.value)} placeholder="Masalan: Qo'shimcha tibbiy ma'lumotnoma" className="mt-2 h-12 w-full border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-400" style={{ borderRadius: 1 }} />
                </label>
              )}

              <label className="mt-5 flex min-h-[130px] cursor-pointer flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-4 text-center hover:border-blue-400" style={{ borderRadius: 1 }}>
                <UploadCloud className="mb-3 text-blue-600" size={28} />
                <span className="text-sm font-black text-brand-depth">{childDocumentFile ? childDocumentFile.name : editingChildDocument?.file_name || 'PDF, Word yoki rasm hujjat yuklang'}</span>
                <span className="mt-1 text-xs font-bold text-brand-muted">.pdf, .doc, .docx, .jpg, .png</span>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" onChange={(event) => setChildDocumentFile(event.target.files?.[0] || null)} className="hidden" />
              </label>

              {childDocumentError && <p className="mt-4 text-sm font-black text-rose-600">{childDocumentError}</p>}

              <button type="submit" disabled={isSavingChildDocument} className="mt-6 h-12 w-full bg-blue-700 text-sm font-black text-white disabled:opacity-60" style={{ borderRadius: 1 }}>
                {isSavingChildDocument ? 'Saqlanmoqda...' : editingChildDocument ? "O'zgarishlarni saqlash" : 'Hujjatni saqlash'}
              </button>
            </form>
          </div>
        )}

        {deleteChildDocument && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <div className="w-full max-w-md border border-rose-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]" style={{ borderRadius: 1 }}>
              <p className="text-[10px] font-black uppercase text-rose-600">Tasdiqlash</p>
              <h3 className="mt-1 text-xl font-black text-brand-depth">Hujjatni o'chirish</h3>
              <p className="mt-4 text-sm font-bold leading-6 text-brand-slate">
                <span className="font-black text-brand-depth">"{deleteChildDocument.document_name}"</span> hujjatini o'chirishni xohlaysizmi?
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setDeleteChildDocument(null)} disabled={isDeletingChildDocument} className="h-12 rounded-[1px] border border-slate-200 bg-white text-sm font-black text-brand-slate hover:bg-slate-50 disabled:opacity-60">Yo'q</button>
                <button type="button" onClick={confirmChildDocumentDelete} disabled={isDeletingChildDocument} className="h-12 rounded-[1px] border border-rose-400 bg-rose-600 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-60">{isDeletingChildDocument ? "O'chirilmoqda..." : "Ha, o'chirish"}</button>
              </div>
            </div>
          </div>
        )}
        {renderPreviewDocumentModal()}
      </div>
    );
  }

  if (activeMenu === 'children') {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/[0.95] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{ backgroundImage: 'linear-gradient(90deg, #0f172a 1px, transparent 1px), linear-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <button
                onClick={() => setActiveMenu('overview')}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[11px] font-black uppercase text-brand-muted ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-blue-700"
              >
                <ChevronRight size={14} className="rotate-180" />
                Arxivga qaytish
              </button>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 via-white to-blue-100 text-blue-700 shadow-[0_18px_34px_rgba(37,99,235,0.12)]">
                <Baby size={25} />
              </div>
              <p className="mb-2 text-[10px] font-black uppercase text-blue-700">Bolalar arxivi</p>
              <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">Bolalarning shaxsiy ma'lumotlari</h1>
              <p className="mt-4 max-w-3xl text-sm font-black leading-6 text-rose-600">
                Bolalarning shaxsiy ma'lumotlarini birovga tarqatish, nusxalash yoki ruxsatsiz berish qat'iyan man qilinadi.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-brand-slate">
                Ushbu ro'yxatda bolalar ma'lumotlarini qidirish, guruh va ota-ona yozuvlari bo'yicha tez ko'rib chiqish mumkin.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
              <input
                value={childSearch}
                onChange={(event) => setChildSearch(event.target.value)}
                placeholder="Bola, guruh, guvohnoma yoki ota-ona bo'yicha qidirish..."
                className="h-14 w-full rounded-2xl border border-blue-100 bg-white/90 pl-12 pr-4 text-sm font-bold text-brand-depth outline-none shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white/[0.94] shadow-[0_22px_58px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-3 border-b border-sky-100 bg-gradient-to-r from-white via-sky-50/70 to-blue-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-brand-muted">Ro'yxat</p>
              <h2 className="text-lg font-black text-brand-depth">Bolalar arxivi</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black text-blue-700 ring-1 ring-blue-100">
              <UsersRound size={15} />
              {filteredChildren.length} ta yozuv
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {childrenLoading ? (
              <div className="p-10 text-center text-sm font-black text-brand-muted">Bolalar ro'yxati yuklanmoqda...</div>
            ) : visibleChildren.length === 0 ? (
              <div className="p-10 text-center">
                <Search className="mx-auto mb-3 text-slate-300" size={34} />
                <p className="text-sm font-black text-brand-depth">Ma'lumot topilmadi</p>
                <p className="mt-1 text-xs font-bold text-brand-muted">Qidiruv so'zini o'zgartirib ko'ring.</p>
              </div>
            ) : (
              visibleChildren.map((child: any, index) => {
                const fatherName = child.father_name || child.father?.full_name || '-';
                const motherName = child.mother_name || child.mother?.full_name || '-';
                const fatherPhone = child.father_phone || child.father?.phone || '';
                const motherPhone = child.mother_phone || child.mother?.phone || '';
                const fullName = getChildFullName(child);

                return (
                  <article
                    key={child.id || index}
                    onClick={() => openChildProfile(child)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openChildProfile(child);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="grid cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-sky-50/45 focus-visible:bg-sky-50 focus-visible:outline-none lg:grid-cols-[3rem_1.2fr_1fr_1fr_1fr_3rem] lg:items-center sm:px-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                      {(childrenPage - 1) * CHILDREN_PAGE_SIZE + index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-depth">{fullName}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-brand-muted">
                        <span>{child.group_name || 'Guruhsiz'}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{child.status || 'ACTIVE'}</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-brand-slate">
                      <p className="text-[10px] font-black uppercase text-brand-muted">Guvohnoma</p>
                      <p className="mt-1">{child.birth_certificate_number || child.passport_info || '-'}</p>
                    </div>
                    <div className="text-xs font-bold text-brand-slate">
                      <p className="text-[10px] font-black uppercase text-brand-muted">Otasi</p>
                      <p className="mt-1 text-brand-depth">{fatherName}</p>
                      {fatherPhone && <p className="mt-0.5 text-brand-muted">{fatherPhone}</p>}
                    </div>
                    <div className="text-xs font-bold text-brand-slate">
                      <p className="text-[10px] font-black uppercase text-brand-muted">Onasi</p>
                      <p className="mt-1 text-brand-depth">{motherName}</p>
                      {motherPhone && <p className="mt-0.5 text-brand-muted">{motherPhone}</p>}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[1px] border border-sky-100 bg-white text-sky-700 shadow-sm">
                      <ChevronRight size={17} />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="border-t border-sky-100 bg-slate-50/70 px-4 py-4">
            <Pagination
              page={childrenPage}
              pageSize={CHILDREN_PAGE_SIZE}
              totalItems={filteredChildren.length}
              onPageChange={setChildrenPage}
            />
          </div>
        </section>
      </div>
    );
  }

  if (activeMenu === 'staffProfile' && selectedStaff) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1px] border border-emerald-100 bg-white/[0.96] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.09)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400" />
          <button
            onClick={() => setActiveMenu('staff')}
            className="mb-5 inline-flex items-center gap-2 rounded-[1px] border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase text-brand-muted shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700"
          >
            <ChevronRight size={14} className="rotate-180" />
            Xodimlar ro'yxatiga qaytish
          </button>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[1px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-100 text-emerald-700 shadow-[0_18px_34px_rgba(5,150,105,0.12)]">
                <UsersRound size={25} />
              </div>
              <p className="mb-2 text-[10px] font-black uppercase text-emerald-700">Xodim profili arxivi</p>
              <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">{selectedStaff.full_name || 'F.I.Sh kiritilmagan'}</h1>
              <p className="mt-4 max-w-3xl text-sm font-black leading-6 text-rose-600">
                Xodimning shaxsiy hujjatlari faqat ichki ish yuritish uchun saqlanadi, ruxsatsiz tarqatish qat'iyan man qilinadi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1px] border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-[10px] font-black uppercase text-brand-muted">Lavozim</p>
                <p className="mt-1 text-sm font-black text-brand-depth">{selectedStaff.position || 'Lavozim kiritilmagan'}</p>
              </div>
              <div className="rounded-[1px] border border-emerald-100 bg-white p-4">
                <p className="text-[10px] font-black uppercase text-brand-muted">Hujjatlar</p>
                <p className="mt-1 text-sm font-black text-emerald-700">{staffDocuments.length} ta saqlangan</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ['Lavozim', selectedStaff.position || 'Lavozim kiritilmagan', selectedStaff.status || 'ACTIVE'],
            ['Aloqa', selectedStaff.phone || 'Telefon kiritilmagan', selectedStaff.email || 'Email kiritilmagan'],
            ['Passport', selectedStaff.passport_no || 'Passport kiritilmagan', selectedStaff.group_name || 'Guruh biriktirilmagan'],
          ].map(([title, value, note]) => (
            <div key={title} className="rounded-[1px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <p className="text-[10px] font-black uppercase text-brand-muted">{title}</p>
              <h3 className="mt-2 text-base font-black text-brand-depth">{value}</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-brand-slate">{note}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[1px] border border-emerald-100 bg-white/[0.94] shadow-[0_22px_58px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-4 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-teal-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-brand-muted">Sub-menu</p>
              <h2 className="text-lg font-black text-brand-depth">Xodimning hujjatlar arxivi</h2>
            </div>
            <button
              onClick={() => openStaffDocumentCreate()}
              className="group inline-flex h-12 items-center justify-center overflow-hidden rounded-[1px] border border-emerald-300/80 bg-emerald-700 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_42px_rgba(5,150,105,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              <span className="flex h-full w-12 items-center justify-center border-r border-white/22 bg-white/10">
                <Plus size={18} />
              </span>
              <span className="px-5">Hujjat kiritish</span>
            </button>
          </div>

          {staffDocumentsLoading ? (
            <div className="p-10 text-center text-sm font-black text-brand-muted">Hujjatlar yuklanmoqda...</div>
          ) : staffDocuments.length === 0 ? (
            <div className="p-8">
              <h3 className="text-xl font-black text-brand-depth">Hali hujjatlar kiritilmagan</h3>
              <p className="mt-2 text-sm font-bold text-brand-slate">Xodim profili uchun passport yoki boshqa xizmat hujjatlarini yuklang.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {staffDocuments.map((document) => {
                const category = staffDocumentCategories.find((item) => item.value === document.category);
                const isUploaded = Boolean(document.file_url && document.file_exists !== false);
                const sourceLabel = document.source === 'profile_data' ? 'Xodim profilidan' : "Qo'lda yuklangan";
                return (
                  <article key={document.id} className="grid gap-4 px-5 py-4 hover:bg-emerald-50/45 sm:px-6 lg:grid-cols-[3rem_1fr_0.9fr_8rem_16rem] lg:items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-depth">{document.document_name}</h3>
                      <p className="mt-1 text-xs font-bold text-brand-muted">
                        {document.text_value || document.file_name || 'Hujjat fayli'}
                      </p>
                      <span className="mt-2 inline-flex rounded-[1px] border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">
                        {sourceLabel}
                      </span>
                    </div>
                    <p className="text-xs font-black text-emerald-700">{category?.label || document.category}</p>
                    <p className="text-xs font-bold text-brand-muted">{document.created_at?.split('T')[0]?.split(' ')[0] || '-'}</p>
                    <div className="inline-flex w-fit items-center gap-1 rounded-[1px] border border-slate-200/90 bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.08)] lg:justify-self-end">
                      <span className={`px-3 text-[10px] font-black uppercase ${isUploaded ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isUploaded ? 'Yuklangan' : 'Yuklanmagan'}
                      </span>
                      {document.file_url && document.file_exists !== false ? (
                        <a href={getArchiveFileUrl(document.file_url)} target="_blank" rel="noreferrer" aria-label="Hujjatni ko'rish" title="Hujjatni ko'rish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-violet-50 text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white">
                          <Eye size={14} />
                        </a>
                      ) : (
                        <button type="button" onClick={() => setPreviewDocument(document)} aria-label="Hujjatni ko'rish" title="Hujjatni ko'rish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-violet-50 text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white">
                          <Eye size={14} />
                        </button>
                      )}
                      <button type="button" onClick={() => openStaffDocumentEdit(document)} aria-label="Hujjatni tahrirlash" title="Hujjatni tahrirlash" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-blue-200/90 bg-blue-50 text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteStaffDocument(document)} aria-label="Hujjatni o'chirish" title="Hujjatni o'chirish" className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-rose-200/90 bg-rose-50 text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {isStaffDocumentModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <form onSubmit={handleStaffDocumentSave} className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]" style={{ borderRadius: 1 }}>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-brand-depth">{editingStaffDocument ? 'Xodim hujjatini tahrirlash' : 'Xodim hujjatini kiriting'}</h3>
                  <p className="mt-1 text-sm font-bold text-brand-muted">Passport yoki boshqa xizmat hujjatini tanlang va faylni yuklang.</p>
                </div>
                <button type="button" onClick={closeStaffDocumentModal} className="p-2 text-brand-muted hover:text-brand-depth">
                  <X size={20} />
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase text-brand-muted">Hujjat turi</span>
                <select value={staffDocumentCategory} onChange={(event) => setStaffDocumentCategory(event.target.value)} className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-400" style={{ borderRadius: 1 }}>
                  {staffDocumentCategories.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </label>

              {staffDocumentCategory === 'OTHER' && (
                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase text-brand-muted">Dokument nomi</span>
                  <input value={staffDocumentName} onChange={(event) => setStaffDocumentName(event.target.value)} placeholder="Masalan: Mehnat shartnomasi" className="mt-2 h-12 w-full border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-400" style={{ borderRadius: 1 }} />
                </label>
              )}

              <label className="mt-5 flex min-h-[130px] cursor-pointer flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-4 text-center hover:border-emerald-400" style={{ borderRadius: 1 }}>
                <UploadCloud className="mb-3 text-emerald-600" size={28} />
                <span className="text-sm font-black text-brand-depth">{staffDocumentFile ? staffDocumentFile.name : editingStaffDocument?.file_name || 'PDF, Word yoki rasm hujjat yuklang'}</span>
                <span className="mt-1 text-xs font-bold text-brand-muted">.pdf, .doc, .docx, .jpg, .png</span>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" onChange={(event) => setStaffDocumentFile(event.target.files?.[0] || null)} className="hidden" />
              </label>

              {staffDocumentError && <p className="mt-4 text-sm font-black text-rose-600">{staffDocumentError}</p>}

              <button type="submit" disabled={isSavingStaffDocument} className="mt-6 h-12 w-full bg-emerald-700 text-sm font-black text-white disabled:opacity-60" style={{ borderRadius: 1 }}>
                {isSavingStaffDocument ? 'Saqlanmoqda...' : editingStaffDocument ? "O'zgarishlarni saqlash" : 'Hujjatni saqlash'}
              </button>
            </form>
          </div>
        )}

        {deleteStaffDocument && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <div className="w-full max-w-md border border-rose-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]" style={{ borderRadius: 1 }}>
              <p className="text-[10px] font-black uppercase text-rose-600">Tasdiqlash</p>
              <h3 className="mt-1 text-xl font-black text-brand-depth">Xodim hujjatini o'chirish</h3>
              <p className="mt-4 text-sm font-bold leading-6 text-brand-slate">
                <span className="font-black text-brand-depth">"{deleteStaffDocument.document_name}"</span> hujjatini o'chirishni xohlaysizmi?
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setDeleteStaffDocument(null)} disabled={isDeletingStaffDocument} className="h-12 rounded-[1px] border border-slate-200 bg-white text-sm font-black text-brand-slate hover:bg-slate-50 disabled:opacity-60">Yo'q</button>
                <button type="button" onClick={confirmStaffDocumentDelete} disabled={isDeletingStaffDocument} className="h-12 rounded-[1px] border border-rose-400 bg-rose-600 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-60">{isDeletingStaffDocument ? "O'chirilmoqda..." : "Ha, o'chirish"}</button>
              </div>
            </div>
          </div>
        )}
        {renderPreviewDocumentModal()}
      </div>
    );
  }

  if (activeMenu === 'staff') {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/[0.95] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{ backgroundImage: 'linear-gradient(90deg, #0f172a 1px, transparent 1px), linear-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <button
                onClick={() => setActiveMenu('overview')}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[11px] font-black uppercase text-brand-muted ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-emerald-700"
              >
                <ChevronRight size={14} className="rotate-180" />
                Arxivga qaytish
              </button>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-100 text-emerald-700 shadow-[0_18px_34px_rgba(5,150,105,0.12)]">
                <UsersRound size={25} />
              </div>
              <p className="mb-2 text-[10px] font-black uppercase text-emerald-700">Xodimlar arxivi</p>
              <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">Xodimlarning xizmat ma'lumotlari</h1>
              <p className="mt-4 max-w-3xl text-sm font-black leading-6 text-rose-600">
                Xodimlarning shaxsiy va xizmat ma'lumotlarini ruxsatsiz tarqatish, nusxalash yoki uchinchi shaxslarga berish qat'iyan man qilinadi.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-brand-slate">
                Ushbu bo'limda bog'chaga tegishli xodimlar ro'yxati, lavozimi, aloqa ma'lumotlari va biriktirilgan guruhi ko'rinadi.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
              <input
                value={staffSearch}
                onChange={(event) => setStaffSearch(event.target.value)}
                placeholder="Xodim, lavozim, telefon, passport yoki guruh bo'yicha qidirish..."
                className="h-14 w-full rounded-2xl border border-emerald-100 bg-white/90 pl-12 pr-4 text-sm font-bold text-brand-depth outline-none shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white/[0.94] shadow-[0_22px_58px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-teal-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-brand-muted">Ro'yxat</p>
              <h2 className="text-lg font-black text-brand-depth">Xodimlar arxivi</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">
              <UsersRound size={15} />
              {filteredStaff.length} ta yozuv
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {staffLoading ? (
              <div className="p-10 text-center text-sm font-black text-brand-muted">Xodimlar ro'yxati yuklanmoqda...</div>
            ) : visibleStaff.length === 0 ? (
              <div className="p-10 text-center">
                <Search className="mx-auto mb-3 text-slate-300" size={34} />
                <p className="text-sm font-black text-brand-depth">Ma'lumot topilmadi</p>
                <p className="mt-1 text-xs font-bold text-brand-muted">Qidiruv so'zini o'zgartirib ko'ring.</p>
              </div>
            ) : (
              visibleStaff.map((member: any, index) => (
                <article
                  key={member.id || index}
                  onClick={() => openStaffProfile(member)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openStaffProfile(member);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="grid cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-emerald-50/45 focus-visible:bg-emerald-50 focus-visible:outline-none lg:grid-cols-[3rem_1.2fr_0.9fr_1fr_0.9fr_0.8fr_3rem] lg:items-center sm:px-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                    {(staffPage - 1) * STAFF_PAGE_SIZE + index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-depth">{member.full_name || 'F.I.Sh kiritilmagan'}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-brand-muted">
                      <span>{member.position || 'Lavozim kiritilmagan'}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{member.status || 'ACTIVE'}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-brand-slate">
                    <p className="text-[10px] font-black uppercase text-brand-muted">Passport</p>
                    <p className="mt-1">{member.passport_no || '-'}</p>
                  </div>
                  <div className="text-xs font-bold text-brand-slate">
                    <p className="text-[10px] font-black uppercase text-brand-muted">Aloqa</p>
                    <p className="mt-1 text-brand-depth">{member.phone || '-'}</p>
                    {member.email && <p className="mt-0.5 text-brand-muted">{member.email}</p>}
                  </div>
                  <div className="text-xs font-bold text-brand-slate">
                    <p className="text-[10px] font-black uppercase text-brand-muted">Guruhi</p>
                    <p className="mt-1 text-brand-depth">{member.group_name || 'Guruhsiz'}</p>
                  </div>
                  <div className="text-xs font-bold text-brand-slate">
                    <p className="text-[10px] font-black uppercase text-brand-muted">Bolalar</p>
                    <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">{member.child_count || 0} ta</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[1px] border border-emerald-100 bg-white text-emerald-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 lg:justify-self-end">
                    <ChevronRight size={17} />
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="border-t border-emerald-100 bg-slate-50/70 px-4 py-4">
            <Pagination
              page={staffPage}
              pageSize={STAFF_PAGE_SIZE}
              totalItems={filteredStaff.length}
              onPageChange={setStaffPage}
            />
          </div>
        </section>
      </div>
    );
  }

  if (activeMenu === 'kindergarten') {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1px] border border-violet-100 bg-white/[0.95] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#7c3aed] via-[#2563eb] to-[#06b6d4]" />
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <button
                onClick={() => setActiveMenu('overview')}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[11px] font-black uppercase text-brand-muted ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-violet-700"
              >
                <ChevronRight size={14} className="rotate-180" />
                Arxivga qaytish
              </button>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-100 text-violet-700 shadow-[0_18px_34px_rgba(124,58,237,0.12)]">
                <School size={25} />
              </div>
              <p className="mb-2 text-[10px] font-black uppercase text-violet-700">MTT arxivi</p>
              <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">Bog'cha ma'lumotlari arxivi</h1>
              <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-brand-slate">
                Bu bo'limda bog'chaga tegishli PDF yoki Word hujjatlarni nomi bilan yuklash va saqlash mumkin.
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1px] border border-violet-100 bg-white/[0.94] shadow-[0_22px_58px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-white via-violet-50/70 to-indigo-50/80 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-brand-muted">Saqlangan hujjatlar</p>
              <h2 className="text-lg font-black text-brand-depth">Bog'cha hujjatlari</h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="rounded-[1px] border border-violet-200/80 bg-[linear-gradient(180deg,#ffffff,#fbfaff)] px-4 py-2 text-[11px] font-black text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(124,58,237,0.10)] ring-1 ring-white/80">
                {kindergartenDocuments.length} ta hujjat
              </div>
              <button
                onClick={openKindergartenDocumentCreate}
                className="group inline-flex h-12 items-center justify-center overflow-hidden rounded-[1px] border border-violet-300/80 bg-[#5b21b6] text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(30,27,75,0.28),0_18px_42px_rgba(91,33,182,0.34)] outline outline-1 -outline-offset-4 outline-white/18 ring-1 ring-violet-950/10 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-[#4c1d95] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(30,27,75,0.30),0_24px_58px_rgba(91,33,182,0.46)] focus-visible:ring-4 focus-visible:ring-violet-200"
              >
                <span className="flex h-full w-12 items-center justify-center border-r border-white/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06))] shadow-[inset_-1px_0_0_rgba(30,27,75,0.18)]">
                  <Plus size={18} />
                </span>
                <span className="px-5">Ma'lumot kiritish</span>
              </button>
            </div>
          </div>

          {kindergartenDocsLoading ? (
            <div className="p-10 text-center text-sm font-black text-brand-muted">Hujjatlar yuklanmoqda...</div>
          ) : kindergartenDocuments.length === 0 ? (
            <div className="p-8">
              <div>
                <h3 className="text-xl font-black text-brand-depth">Hali ma'lumotlar kiritilmagan</h3>
                <p className="mt-2 text-sm font-bold text-brand-slate">Bog'cha hujjatlarini saqlash uchun ma'lumot kiriting.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {kindergartenDocuments.map((document) => {
                const isUploaded = Boolean(document.file_url && document.file_exists !== false);
                return (
                <article
                  key={document.id}
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-violet-50/45 sm:px-6 lg:grid-cols-[3rem_1fr_0.85fr_8rem_18rem] lg:items-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-depth">{document.document_name}</h3>
                    <p className="mt-1 text-xs font-bold text-brand-muted">{document.file_name || 'Hujjat fayli'}</p>
                  </div>
                  <p className="text-xs font-bold text-brand-slate">{document.mime_type || 'PDF / Word hujjat'}</p>
                  <p className="text-xs font-bold text-brand-muted">{document.created_at?.split('T')[0]?.split(' ')[0] || '-'}</p>
                  <div className="inline-flex w-fit items-center gap-1 rounded-[1px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_16px_34px_rgba(15,23,42,0.08)] ring-1 ring-white/90 lg:justify-self-end">
                    <span className={`px-3 text-[10px] font-black uppercase ${isUploaded ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isUploaded ? 'Yuklangan' : 'Fayl topilmadi'}
                    </span>
                    {isUploaded ? (
                      <a
                        href={getKindergartenDocumentUrl(document.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Hujjatni ochish"
                        title="Hujjatni ochish"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-[linear-gradient(180deg,#faf5ff,#f3e8ff)] text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/80 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-none hover:bg-violet-600 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_rgba(124,58,237,0.25)] focus-visible:ring-4 focus-visible:ring-violet-100"
                      >
                        <Eye size={14} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewDocument({ ...document, category: "Bog'cha hujjati" })}
                        aria-label="Hujjat holatini ko'rish"
                        title="Hujjat holatini ko'rish"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-violet-200/90 bg-[linear-gradient(180deg,#faf5ff,#f3e8ff)] text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openKindergartenDocumentEdit(document)}
                      aria-label="Hujjatni tahrirlash"
                      title="Hujjatni tahrirlash"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-blue-200/90 bg-[linear-gradient(180deg,#eff6ff,#dbeafe)] text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/80 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-none hover:bg-blue-600 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_rgba(37,99,235,0.24)] focus-visible:ring-4 focus-visible:ring-blue-100"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteKindergartenDocument(document)}
                      aria-label="Hujjatni o'chirish"
                      title="Hujjatni o'chirish"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[1px] border border-rose-200/90 bg-[linear-gradient(180deg,#fff1f2,#ffe4e6)] text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/80 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-none hover:bg-rose-600 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_rgba(225,29,72,0.23)] focus-visible:ring-4 focus-visible:ring-rose-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>

        {isKindergartenModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <form
              onSubmit={handleKindergartenDocumentSave}
              className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]"
              style={{ borderRadius: 1 }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-brand-depth">
                    {editingKindergartenDocument ? "Bog'cha ma'lumotlarini tahrirlash" : "Bog'cha ma'lumotlarini kiriting"}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-brand-muted">
                    {editingKindergartenDocument
                      ? "Dokument nomini o'zgartiring yoki yangi PDF/Word fayl bilan almashtiring."
                      : "Dokument nomi va PDF/Word hujjatni yuklang."}
                  </p>
                </div>
                <button type="button" onClick={closeKindergartenModal} className="p-2 text-brand-muted hover:text-brand-depth">
                  <X size={20} />
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase text-brand-muted">Dokument nomi</span>
                <input
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  placeholder="Masalan: Litsenziya hujjati"
                  className="mt-2 h-12 w-full border border-slate-200 px-4 text-sm font-bold outline-none focus:border-violet-400"
                  style={{ borderRadius: 1 }}
                />
              </label>

              <label className="mt-5 flex min-h-[130px] cursor-pointer flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-4 text-center hover:border-violet-400" style={{ borderRadius: 1 }}>
                <UploadCloud className="mb-3 text-violet-600" size={28} />
                <span className="text-sm font-black text-brand-depth">
                  {documentFile ? documentFile.name : editingKindergartenDocument?.file_name || 'PDF yoki Word hujjat yuklang'}
                </span>
                <span className="mt-1 text-xs font-bold text-brand-muted">
                  {editingKindergartenDocument ? "Yangi fayl tanlanmasa, avvalgi hujjat saqlanadi" : '.pdf, .doc, .docx'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {documentError && <p className="mt-4 text-sm font-black text-rose-600">{documentError}</p>}

              <button
                type="submit"
                disabled={isSavingDocument}
                className="mt-6 h-12 w-full bg-violet-600 text-sm font-black text-white disabled:opacity-60"
                style={{ borderRadius: 1 }}
              >
                {isSavingDocument ? 'Saqlanmoqda...' : editingKindergartenDocument ? "O'zgarishlarni saqlash" : 'Hujjatni saqlash'}
              </button>
            </form>
          </div>
        )}

        {deleteKindergartenDocument && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <div
              className="w-full max-w-md border border-rose-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.18)]"
              style={{ borderRadius: 1 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-rose-600">Tasdiqlash</p>
                  <h3 className="mt-1 text-xl font-black text-brand-depth">Hujjatni o'chirish</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteKindergartenDocument(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[1px] border border-slate-200 bg-white text-brand-muted transition-colors hover:border-slate-300 hover:text-brand-depth"
                  disabled={isDeletingDocument}
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm font-bold leading-6 text-brand-slate">
                <span className="font-black text-brand-depth">"{deleteKindergartenDocument.document_name}"</span> hujjatini o'chirishni xohlaysizmi?
              </p>
              <p className="mt-2 text-xs font-bold text-brand-muted">Tasdiqlasangiz, hujjat arxiv ro'yxatidan o'chirib yuboriladi.</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteKindergartenDocument(null)}
                  disabled={isDeletingDocument}
                  className="h-12 rounded-[1px] border border-slate-200 bg-white text-sm font-black text-brand-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  Yo'q
                </button>
                <button
                  type="button"
                  onClick={confirmKindergartenDocumentDelete}
                  disabled={isDeletingDocument}
                  className="h-12 rounded-[1px] border border-rose-400 bg-rose-600 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_34px_rgba(225,29,72,0.24)] transition-all hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-60"
                >
                  {isDeletingDocument ? "O'chirilmoqda..." : "Ha, o'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.65rem] border border-sky-100 bg-white/[0.94] p-5 shadow-[0_22px_62px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.055]" style={{ backgroundImage: 'linear-gradient(90deg, #0f172a 1px, transparent 1px), linear-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-sky-50/80 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-emerald-700 shadow-[0_14px_28px_rgba(5,150,105,0.11)]">
              <Archive size={22} />
            </div>
            <p className="mb-2 text-[10px] font-black uppercase text-emerald-700">Ma'lumotlar fondi</p>
            <h1 className="text-3xl font-black text-brand-depth sm:text-4xl">Arxiv</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-brand-slate">
              Arxiv bo'limida bolalar, xodimlar va MTTga tegishli asosiy ma'lumotlarni tizimli ravishda kiritish va saqlash mumkin.
            </p>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-brand-slate">
              Har bir yo'nalish alohida ma'lumot guruhiga ajratiladi, bu hujjatlar va tarixiy yozuvlarni tez topishga yordam beradi.
            </p>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-brand-slate">
              Keyingi bosqichda ushbu arxiv kartalari orqali real yozuvlarni ochish, yangilash va nazorat qilish imkoniyati ulanadi.
            </p>
          </div>

          <div className="w-full max-w-sm lg:w-[22rem]">
            <div className="relative mb-4 h-32">
              <div className="absolute left-6 top-7 h-24 w-40 rotate-[-6deg] rounded-2xl border border-sky-100 bg-white/[0.88] p-3 shadow-[0_14px_30px_rgba(15,23,42,0.09)]">
                <div className="mb-3 flex items-center gap-2 text-sky-700">
                  <FileText size={15} />
                  <span className="text-[10px] font-black uppercase">Bola profili</span>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-28 rounded-full bg-sky-100" />
                  <div className="h-1.5 w-20 rounded-full bg-slate-100" />
                  <div className="h-1.5 w-32 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="absolute right-0 top-1 h-28 w-44 rotate-[5deg] rounded-2xl border border-emerald-100 bg-white/[0.94] p-3 shadow-[0_18px_36px_rgba(15,23,42,0.11)]">
                <div className="mb-3 flex items-center gap-2 text-emerald-700">
                  <ShieldCheck size={15} />
                  <span className="text-[10px] font-black uppercase">Xodim hujjati</span>
                </div>
                <div className="grid grid-cols-[2rem_1fr] gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50" />
                  <div className="space-y-2 pt-1">
                    <div className="h-1.5 w-20 rounded-full bg-emerald-100" />
                    <div className="h-1.5 w-24 rounded-full bg-slate-100" />
                    <div className="h-1.5 w-16 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-12 h-24 w-48 rounded-2xl border border-violet-100 bg-white/[0.96] p-3 shadow-[0_18px_38px_rgba(15,23,42,0.12)]">
                <div className="mb-3 flex items-center gap-2 text-violet-700">
                  <Database size={15} />
                  <span className="text-[10px] font-black uppercase">MTT rekvizitlari</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-violet-500 to-sky-500" />
                </div>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
              <span className="text-[10px] font-black uppercase text-brand-muted">Arxiv yo'nalishlari</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">3 bo'lim</span>
            </div>
            <div className="space-y-3">
              {archiveCards.map((card) => (
                <div key={card.code} className="grid grid-cols-[2.5rem_1fr] items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-[11px] font-black text-brand-depth shadow-sm ring-1 ring-slate-200/70">
                    {card.code}
                  </span>
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-xs font-black text-brand-depth">{card.label}</p>
                      <card.metaIcon size={14} className="text-brand-muted" />
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full w-full rounded-full bg-gradient-to-r ${card.accent}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {archiveCards.map((card) => (
          <article
            key={card.title}
            onClick={() => {
              if (card.code === '01') setActiveMenu('children');
              if (card.code === '02') setActiveMenu('staff');
              if (card.code === '03') setActiveMenu('kindergarten');
            }}
            className={`group relative min-h-[220px] cursor-pointer overflow-hidden rounded-[1.65rem] border bg-gradient-to-br p-6 shadow-[0_20px_52px_rgba(15,23,42,0.075)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_76px_rgba(15,23,42,0.12)] ${card.tone}`}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (card.code === '01') setActiveMenu('children');
                if (card.code === '02') setActiveMenu('staff');
                if (card.code === '03') setActiveMenu('kindergarten');
              }
            }}
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),transparent_54%)]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-tl-[3rem] bg-white/42" />
            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/92 shadow-[0_14px_30px_rgba(15,23,42,0.09)] ring-1 ring-white/90">
                  <card.icon size={23} />
                </div>
                <span className="rounded-full bg-white/78 px-3 py-1.5 text-[10px] font-black uppercase text-brand-muted shadow-sm ring-1 ring-white/80">
                  {card.label}
                </span>
              </div>
              <h2 className="max-w-[15rem] text-xl font-black leading-tight text-brand-depth">{card.title}</h2>
              <p className="mt-4 text-sm font-bold leading-6 text-brand-slate">{card.description}</p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/[0.58] px-3 py-2 text-[11px] font-black uppercase text-brand-muted ring-1 ring-white/70">
                <span>Bo'lim</span>
                <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ArchiveView;
