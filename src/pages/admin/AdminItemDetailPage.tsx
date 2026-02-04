import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Reveal from '../../components/Reveal';
import BackArrowIcon from '../../components/BackArrowIcon';
import MarkdownEditor from '../../components/MarkdownEditor';
import { useConfirm } from '../../components/confirm/useConfirm';
import { useToast } from '../../components/toast/useToast';
import { adminProjectsApi, type AdminProjectResponse, uploadToPresignedUrl } from '../../api/adminProjects';
import {
  adminItemsApi,
  type AdminItemImage,
  type AdminItemResponse,
  type AdminItemSaleType,
  type AdminItemStatus,
  type PresignPutItem,
} from '../../api/adminItems';

type ValidationField = 'name' | 'description' | 'price' | 'targetQty';
type ValidationResult = { field: ValidationField; message: string };

type ImageItem = {
  id: string;
  imageId?: number | string;
  key?: string;
  url?: string;
  previewUrl?: string;
  isUploading?: boolean;
  error?: string | null;
};

type AdminItemForm = {
  id: string;
  name: string;
  summary?: string;
  description: string;
  price: number;
  saleType: AdminItemSaleType;
  status: AdminItemStatus;
  targetQty?: number;
  fundedQty: number;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  thumbnailPreviewUrl?: string;
  images: ImageItem[];
  isUploadingThumbnail?: boolean;
  thumbnailUploadError?: string | null;
  imageUploadError?: string | null;
  validationError?: string | null;
};

type AdminItemUpdatePayload = {
  name: string;
  summary?: string;
  description: string;
  price: number;
  saleType: AdminItemSaleType;
  status: AdminItemStatus;
  thumbnailKey: string;
  targetQty?: number;
  fundedQty: number;
};

const STATUS_OPTIONS: { label: string; value: AdminItemStatus }[] = [
  { label: '준비중', value: 'PREPARING' },
  { label: '진행중', value: 'OPEN' },
  { label: '마감', value: 'CLOSED' },
];

const SALETYPE_OPTIONS: { label: string; value: AdminItemSaleType }[] = [
  { label: '일반', value: 'NORMAL' },
  { label: '공구', value: 'GROUPBUY' },
];

const INPUT_CLASS =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10';

function resolveContentType(file: File): string {
  if (file.type && file.type.trim().length > 0) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function buildImageItems(images?: AdminItemImage[] | null): ImageItem[] {
  const list = images ?? [];
  return list
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((image) => ({
      id: `image-${image.id}`,
      imageId: image.id,
      key: image.imageKey ?? undefined,
      url: image.imageUrl ?? undefined,
    }));
}

function mapItemToForm(item: AdminItemResponse): AdminItemForm {
  return {
    id: String(item.id),
    name: item.name ?? '',
    summary: item.summary ?? '',
    description: item.description ?? '',
    price: item.price ?? 0,
    saleType: item.saleType ?? 'NORMAL',
    status: item.status ?? 'PREPARING',
    targetQty: item.targetQty ?? undefined,
    fundedQty: item.fundedQty ?? 0,
    thumbnailKey: item.thumbnailKey ?? undefined,
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    images: buildImageItems(item.images),
  };
}

function matchPresignItems(files: File[], items: PresignPutItem[]): PresignPutItem[] {
  const map = new Map<string, PresignPutItem[]>();
  items.forEach((item) => {
    const list = map.get(item.fileName) ?? [];
    list.push(item);
    map.set(item.fileName, list);
  });

  return files.map((file, idx) => {
    const list = map.get(file.name);
    if (list && list.length > 0) return list.shift() as PresignPutItem;
    return items[idx] as PresignPutItem;
  });
}

type SortableImageProps = {
  item: ImageItem;
  onRemove: (id: string) => void;
  isDeleting?: boolean;
};

function SortableImageCard({ item, onRemove, isDeleting = false }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  const src = item.previewUrl ?? item.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100',
        isDragging ? 'opacity-60' : '',
        isOver ? 'ring-2 ring-primary/30' : '',
      ].join(' ')}
    >
      {src ? (
        <img src={src} alt="상세 이미지 미리보기" className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 items-center justify-center text-[10px] font-semibold text-slate-400">
          이미지가 없어요
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={isDeleting}
        className={[
          'absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100',
          isDeleting ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        ✕
      </button>

      <button
        type="button"
        className="absolute left-1 top-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 opacity-0 transition group-hover:opacity-100"
        aria-label="이미지 순서 변경"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      {item.isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-bold text-white">
          업로드 중...
        </div>
      )}

      {item.error && (
        <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 px-1 py-1 text-[10px] font-semibold text-white">
          {item.error}
        </div>
      )}
    </div>
  );
}

export default function AdminItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const confirm = useConfirm();
  const toast = useToast();
  const [project, setProject] = useState<AdminProjectResponse | null>(null);
  const [item, setItem] = useState<AdminItemForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailDeleting, setThumbnailDeleting] = useState(false);
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [fundedQtyInput, setFundedQtyInput] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingFundedQty, setIsEditingFundedQty] = useState(false);
  const [initialSnapshotReady, setInitialSnapshotReady] = useState(false);

  const objectUrlsRef = useRef<string[]>([]);
  const itemRef = useRef<AdminItemForm | null>(null);
  const initialItemRef = useRef<AdminItemForm | null>(null);
  const thumbnailSectionRef = useRef<HTMLDivElement | null>(null);
  const detailImagesSectionRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const createPreviewUrl = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  }, []);

  const revokePreviewUrl = useCallback((url?: string) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current = objectUrlsRef.current.filter((item) => item !== url);
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    itemRef.current = item;
    if (item && !initialItemRef.current) {
      initialItemRef.current = {
        ...item,
        images: item.images.map((image) => ({ ...image })),
      };
      setInitialSnapshotReady(true);
    }
  }, [item]);

  useEffect(() => {
    if (!item || isEditingPrice) return;
    setPriceInput(item.price === 0 ? '' : String(item.price));
  }, [item?.price, isEditingPrice, item]);

  useEffect(() => {
    if (!item || isEditingFundedQty) return;
    setFundedQtyInput(item.fundedQty === 0 ? '' : String(item.fundedQty));
  }, [item?.fundedQty, isEditingFundedQty, item]);

  const digitsOnly = useCallback((value: string) => value.replace(/[^\d]/g, ''), []);

  const normalizeDigits = useCallback(
    (value: string) => {
      const digits = digitsOnly(value);
      if (!digits) return '';
      const normalized = digits.replace(/^0+/, '');
      return normalized.length ? normalized : '0';
    },
    [digitsOnly],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      if (!itemId) return;
      initialItemRef.current = null;
      setInitialSnapshotReady(false);
      setLoading(true);
      setError(null);
      try {
        const detail = await adminItemsApi.getById(itemId);
        if (!active) return;
        if (!detail) {
          setItem(null);
          setError('상품을 찾을 수 없어요.');
          return;
        }
        setItem(mapItemToForm(detail));
        if (detail.projectId) {
          const projectDetail = await adminProjectsApi.getById(String(detail.projectId));
          if (active) setProject(projectDetail ?? null);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '상품을 불러오지 못했어요.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [itemId]);

  const updateItem = useCallback((patch: Partial<AdminItemForm>) => {
    setItem((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  }, []);

  const getValidation = useCallback((current: AdminItemForm): ValidationResult | null => {
    if (!current.name.trim()) return { field: 'name', message: '상품 명을 입력해주세요' };
    if (!current.description.trim())
      return { field: 'description', message: '상세 설명을 입력해주세요' };
    if (!Number.isFinite(current.price) || current.price <= 0)
      return { field: 'price', message: '가격을 입력해주세요' };
    if (current.saleType === 'GROUPBUY' && (!current.targetQty || current.targetQty <= 0)) {
      return { field: 'targetQty', message: '목표 수량을 입력해주세요' };
    }
    return null;
  }, []);

  const buildPayloadUpdate = useCallback((current: AdminItemForm): AdminItemUpdatePayload | null => {
    const thumbnailKey = current.thumbnailKey?.trim();
    if (!thumbnailKey) return null;

    const payload: AdminItemUpdatePayload = {
      name: current.name.trim(),
      summary: current.summary?.trim() ?? '',
      description: current.description.trim(),
      price: Number(current.price),
      saleType: current.saleType,
      status: current.status,
      fundedQty: Number(current.fundedQty ?? 0),
      thumbnailKey,
    };

    if (current.saleType === 'GROUPBUY' && current.targetQty) {
      payload.targetQty = Number(current.targetQty);
    }

    return payload;
  }, []);

  const handleSave = useCallback(async () => {
    if (!item) return;
    const normalizedPriceStr = normalizeDigits(priceInput);
    const normalizedFundedQtyStr = normalizeDigits(fundedQtyInput);
    const normalized = {
      ...item,
      price: normalizedPriceStr === '' ? 0 : Number(normalizedPriceStr),
      fundedQty: normalizedFundedQtyStr === '' ? 0 : Number(normalizedFundedQtyStr),
    };
    const validation = getValidation(normalized);
    if (validation) {
      updateItem({ validationError: validation.message });
      return;
    }
    const hasThumbnail = Boolean(
      normalized.thumbnailKey?.trim() || item.thumbnailUrl || item.thumbnailPreviewUrl,
    );
    if (!hasThumbnail) {
      await confirm.open({
        title: '대표 이미지가 없어요',
        description: '대표 이미지를 등록해야 저장할 수 있어요.',
        confirmText: '확인',
      });
      thumbnailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const hasDetailImages = item.images.some(
      (img) => img.imageId || img.key || img.url || img.previewUrl,
    );
    if (!hasDetailImages) {
      const ok = await confirm.open({
        title: '상세 이미지가 없어요',
        description:
          '상세 이미지 없이도 저장할 수 있지만, 상품 이해를 돕기 위해 등록을 권장해요. 저장할까요?',
        confirmText: '저장',
        cancelText: '등록할래요',
      });
      if (!ok) {
        detailImagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    if (!normalized.thumbnailKey || normalized.thumbnailKey.trim().length === 0) {
      updateItem({ validationError: '대표 이미지를 등록해주세요.' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayloadUpdate(normalized);
      if (!payload) {
        updateItem({ validationError: '대표 이미지를 등록해주세요.' });
        setSaving(false);
        return;
      }
      await adminItemsApi.updateItem(item.id, payload);
      updateItem({ price: normalized.price, fundedQty: normalized.fundedQty });
      setPriceInput(normalized.price === 0 ? '' : normalizedPriceStr);
      setFundedQtyInput(normalized.fundedQty === 0 ? '' : normalizedFundedQtyStr);
      toast.success('저장했어요');
      initialItemRef.current = {
        ...normalized,
        images: normalized.images.map((image) => ({ ...image })),
      };
      setInitialSnapshotReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장에 실패했어요.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [
    buildPayloadUpdate,
    confirm,
    fundedQtyInput,
    getValidation,
    item,
    normalizeDigits,
    priceInput,
    toast,
    updateItem,
  ]);

  const snapshotItem = useCallback((value: AdminItemForm | null) => {
    if (!value) return null;
    const normalizeString = (input?: string | null) => {
      const trimmed = typeof input === 'string' ? input.trim() : '';
      return trimmed.length ? trimmed : null;
    };

    const thumbnailKey = normalizeString(value.thumbnailKey);
    const thumbnailUrl = normalizeString(value.thumbnailUrl);
    const hasThumbnailPreview = Boolean(value.thumbnailPreviewUrl);

    return {
      name: normalizeString(value.name),
      summary: normalizeString(value.summary ?? ''),
      description: normalizeString(value.description),
      price: Number(value.price ?? 0),
      saleType: value.saleType,
      status: value.status,
      targetQty: value.targetQty ?? null,
      fundedQty: value.fundedQty ?? null,
      thumbnailKey,
      thumbnailUrl,
      hasThumbnailPreview,
      images: value.images
        .filter((img) => img.imageId || img.key || img.previewUrl)
        .map((img) => ({
          imageId: img.imageId ?? null,
          key: normalizeString(img.key),
          hasPreview: Boolean(img.previewUrl),
        }))
        .sort((a, b) => {
        const aa = String(a.imageId ?? a.key ?? '');
        const bb = String(b.imageId ?? b.key ?? '');
        return aa.localeCompare(bb);
      }),
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (!initialSnapshotReady || !item) return false;
    const initial = snapshotItem(initialItemRef.current);
    const current = snapshotItem(item);
    if (!initial || !current) return false;
    return JSON.stringify(initial) !== JSON.stringify(current);
  }, [initialSnapshotReady, item, snapshotItem]);

  const handleBack = useCallback(async () => {
    const targetPath = project?.id ? `/admin/projects/${project.id}/items` : '/admin/projects';
    if (!hasChanges) {
      navigate(targetPath);
      return;
    }

    const ok = await confirm.open({
      title: '변경사항이 저장되지 않았어요',
      description: '나가면 입력한 내용이 사라집니다.',
      confirmText: '나가기',
      cancelText: '계속 편집',
      danger: true,
    });
    if (ok) {
      navigate(targetPath);
    }
  }, [confirm, hasChanges, navigate, project?.id]);

  const handleThumbnailSelect = useCallback(
    async (files: File[]) => {
      if (!item || !files.length) return;
      const file = files[0];
      if (item.thumbnailPreviewUrl) revokePreviewUrl(item.thumbnailPreviewUrl);
      const previewUrl = createPreviewUrl(file);
      updateItem({
        thumbnailPreviewUrl: previewUrl,
        isUploadingThumbnail: true,
        thumbnailUploadError: null,
      });
      try {
        const contentType = resolveContentType(file);
        const res = await adminItemsApi.presignThumbnail(item.id, {
          files: [{ fileName: file.name, contentType }],
        });
        const target = res.items?.[0];
        if (!target) throw new Error('업로드 URL이 없어요');
        await uploadToPresignedUrl(target.uploadUrl, file, contentType);
        updateItem({ thumbnailKey: target.key });
      } catch (err) {
        updateItem({
          thumbnailUploadError: err instanceof Error ? err.message : '업로드에 실패했어요',
        });
      } finally {
        updateItem({ isUploadingThumbnail: false });
      }
    },
    [createPreviewUrl, item, revokePreviewUrl, updateItem],
  );

  const handleImagesUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const current = itemRef.current;
      if (!current) return;
      const currentItemId = current.id;
      const baseOrder = current.images.filter((img) => !img.id.startsWith('upload-')).length;
      const now = Date.now();
      const uploadItems = files.map((file, idx) => ({
        id: `upload-${now}-${idx}`,
        file,
      }));

      setItem((prev) => {
        if (!prev) return prev;
        const newImages: ImageItem[] = uploadItems.map(({ id, file }) => ({
          id,
          previewUrl: createPreviewUrl(file),
          isUploading: true,
        }));
        return {
          ...prev,
          images: [...prev.images, ...newImages],
          imageUploadError: null,
        };
      });

      const payloadFiles = uploadItems.map(({ file }) => ({
        fileName: file.name,
        contentType: resolveContentType(file),
      }));

      try {
        const res = await adminItemsApi.presignImages(currentItemId, { files: payloadFiles });
        const items = res.items ?? [];
        const matched = matchPresignItems(uploadItems.map((i) => i.file), items);

        await Promise.all(
          matched.map((target, idx) => {
            const uploadItem = uploadItems[idx];
            return uploadToPresignedUrl(
              target.uploadUrl,
              uploadItem.file,
              resolveContentType(uploadItem.file),
            );
          }),
        );

        const imagesPayload = matched.map((target, idx) => ({
          imageKey: target.key,
          sortOrder: baseOrder + idx,
        }));

        const savedImages = await adminItemsApi.addImages(currentItemId, {
          images: imagesPayload,
        });

        const uploadingIdSet = new Set(uploadItems.map((u) => u.id));

        setItem((prev) => {
          if (!prev) return prev;
        
          const savedByOrder = new Map<number, AdminItemImage>();
          const savedByKey = new Map<string, AdminItemImage>();
          (savedImages ?? []).forEach((saved) => {
            if (saved.sortOrder !== null && saved.sortOrder !== undefined) {
              savedByOrder.set(saved.sortOrder, saved);
            }
            if (saved.imageKey) savedByKey.set(saved.imageKey, saved);
          });
        
          const nextImages = prev.images.map((image) => {
            if (!uploadingIdSet.has(image.id)) return image;
        
            const index = uploadItems.findIndex((u) => u.id === image.id);
            if (index < 0) return image;
        
            const target = matched[index];
            if (!target) return image;
        
            const expectedOrder = baseOrder + index;
            const saved = savedByOrder.get(expectedOrder) ?? savedByKey.get(target.key);
        
            return {
              ...image,
              key: target.key,
              url: saved?.imageUrl ?? image.url,
              imageId: saved?.id ?? image.imageId,
              isUploading: false,
            };
          });
        
          return { ...prev, images: nextImages, imageUploadError: null };
        });
      } catch (err) {
        setItem((prev) => {
          if (!prev) return prev;
          const failedIds = new Set(uploadItems.map((u) => u.id));
          return {
            ...prev,
            images: prev.images.filter((image) => !failedIds.has(image.id)),
            imageUploadError:
              err instanceof Error ? err.message : '업로드에 실패했어요',
          };
        });
      }
    },
    [createPreviewUrl],
  );

  const handleImageRemove = useCallback(
    async (id: string) => {
      if (!item) return;
      if (deletingImageIds.includes(id)) return;

      const ok = await confirm.open({
        title: '이미지 삭제',
        description: '이 이미지를 삭제할까요? 삭제 후 재등록 해야 해요.',
        danger: true,
        confirmText: '삭제',
      });
      if (!ok) return;

      const prevImages = item.images;
      const target = prevImages.find((image) => image.id === id);
      if (!target) return;

      setDeletingImageIds((prev) => [...prev, id]);
      setItem((prev) => {
        if (!prev) return prev;
        return { ...prev, images: prev.images.filter((image) => image.id !== id) };
      });

      if (!target.imageId) {
        setDeletingImageIds((prev) => prev.filter((imageId) => imageId !== id));
        toast.success('삭제했어요');
        return;
      }

      try {
        await adminItemsApi.deleteImage(item.id, target.imageId);
        toast.success('삭제했어요');
      } catch (err) {
        setItem((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            images: prevImages,
            imageUploadError: err instanceof Error ? err.message : '삭제에 실패했어요',
          };
        });
        toast.error('삭제에 실패했어요');
      } finally {
        setDeletingImageIds((prev) => prev.filter((imageId) => imageId !== id));
      }
    },
    [confirm, deletingImageIds, item, toast],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!item) return;
      if (item.images.some((img) => img.isUploading)) {
        setError('업로드 중에는 순서를 바꿀 수 없어요.');
        return;
      }
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = item.images.findIndex((image) => image.id === active.id);
      const newIndex = item.images.findIndex((image) => image.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const prevImages = item.images;
      const nextImages = arrayMove(prevImages, oldIndex, newIndex);
      setItem((prev) => (prev ? { ...prev, images: nextImages } : prev));

      const imageIds = nextImages
        .map((image) => image.imageId)
        .filter((id): id is string | number => id !== undefined && id !== null);
      if (imageIds.length !== nextImages.length) {
        setItem((prev) => (prev ? { ...prev, images: prevImages } : prev));
        setError('정렬을 저장할 수 없어요. 잠시 후 다시 시도해 주세요.');
        return;
      }

      try {
        await adminItemsApi.updateImagesOrder(item.id, { imageIds });
      } catch (err) {
        setItem((prev) => (prev ? { ...prev, images: prevImages } : prev));
        setError(err instanceof Error ? err.message : '정렬 저장에 실패했어요.');
      }
    },
    [item],
  );

  const imageIds = useMemo(() => item?.images.map((image) => image.id) ?? [], [item?.images]);
  const thumbnailSrc = item?.thumbnailPreviewUrl ?? item?.thumbnailUrl;
  const isUploading =
    Boolean(item?.isUploadingThumbnail) || Boolean(item?.images.some((img) => img.isUploading));
  const isDetailUploading = Boolean(item?.images.some((img) => img.isUploading));
  const hasName = Boolean(item?.name.trim());
  const hasPrice = normalizeDigits(priceInput) !== '';
  const hasThumbnail = Boolean(
    item?.thumbnailKey?.trim() || item?.thumbnailPreviewUrl || item?.thumbnailUrl,
  );
  const isFormValid = hasName && hasPrice && hasThumbnail;
  const isSaveEnabled = !saving && !isUploading && isFormValid && hasChanges;

  const handleThumbnailClear = useCallback(async () => {
    if (!item || thumbnailDeleting) return;
    const ok = await confirm.open({
      title: '대표 이미지 삭제',
      description: '대표 이미지를 삭제할까요? 삭제 후 재등록 해야 해요.',
      danger: true,
      confirmText: '삭제',
    });
    if (!ok) return;

    const prev = {
      thumbnailKey: item.thumbnailKey,
      thumbnailUrl: item.thumbnailUrl,
      thumbnailPreviewUrl: item.thumbnailPreviewUrl,
    };

    setThumbnailDeleting(true);
    updateItem({
      thumbnailKey: undefined,
      thumbnailUrl: undefined,
      thumbnailPreviewUrl: undefined,
    });

    try {
      await adminItemsApi.deleteThumbnail(item.id);
      toast.success('삭제했어요');
    } catch (err) {
      updateItem(prev);
      setError(err instanceof Error ? err.message : '대표 이미지 삭제에 실패했어요.');
      toast.error('삭제에 실패했어요');
    } finally {
      setThumbnailDeleting(false);
    }
  }, [confirm, item, thumbnailDeleting, toast, updateItem]);

  if (!itemId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">
        상품 정보가 필요해요.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              <BackArrowIcon className="h-5 w-5" />
              프로젝트 상품
            </button>
            <h1 className="mt-2 font-heading text-3xl text-primary">상품 관리</h1>
            <p className="mt-2 text-sm text-slate-600">
              상품 정보를 편집할 수 있어요
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!isSaveEnabled}
              className={[
                'rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition',
                !isSaveEnabled ? 'opacity-60' : 'hover:opacity-95',
              ].join(' ')}
            >
              {saving ? '저장 중...' : isUploading ? '업로드 중...' : '저장'}
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={120} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading && <p className="text-sm text-slate-500">불러오는 중...</p>}
        {error && <p className="mb-4 text-sm font-semibold text-rose-600">{error}</p>}

        {item && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {item.name.trim() ? (
                  <>
                    <span className="text-base font-bold text-slate-900">{item.name}</span>
                    {hasChanges && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        변경됨
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex h-4 w-32 rounded-full bg-slate-200/80" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) => updateItem({ status: e.target.value as AdminItemStatus })}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {item.validationError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {item.validationError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">상품 명</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem({ name: e.target.value, validationError: null })}
                  placeholder="상품명을 입력해주세요"
                  className={`${INPUT_CLASS} mt-2`}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">한 줄 설명</label>
                <input
                  type="text"
                  maxLength={255}
                  value={item.summary ?? ''}
                  onChange={(e) => updateItem({ summary: e.target.value })}
                  placeholder="한 줄 설명을 입력해주세요 (최대 255자)"
                  className={`${INPUT_CLASS} mt-2`}
                />
                <p className="mt-1 text-[11px] text-slate-400">255자 이내로 입력해주세요</p>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">가격</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  placeholder="가격을 입력해주세요 (숫자만 입력)"
                  onFocus={() => setIsEditingPrice(true)}
                  onChange={(e) => {
                    const next = digitsOnly(e.target.value);
                    setPriceInput(next);
                  }}
                  onBlur={() => {
                    setIsEditingPrice(false);
                    const normalized = normalizeDigits(priceInput);
                    setPriceInput(normalized);
                    updateItem({
                      price: normalized === '' ? 0 : Number(normalized),
                      validationError: null,
                    });
                  }}
                  className={`${INPUT_CLASS} mt-2`}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">판매 유형</label>
                <select
                  value={item.saleType}
                  onChange={(e) =>
                    updateItem({
                      saleType: e.target.value as AdminItemSaleType,
                      targetQty:
                        e.target.value === 'GROUPBUY' ? item.targetQty : undefined,
                    })
                  }
                  className={`${INPUT_CLASS} mt-2`}
                >
                  {SALETYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">펀딩 수량</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fundedQtyInput}
                  placeholder="판매 수량을 입력해주세요"
                  onFocus={() => setIsEditingFundedQty(true)}
                  onChange={(e) => {
                    const next = digitsOnly(e.target.value);
                    setFundedQtyInput(next);
                  }}
                  onBlur={() => {
                    setIsEditingFundedQty(false);
                    const normalized = normalizeDigits(fundedQtyInput);
                    setFundedQtyInput(normalized);
                    updateItem({ fundedQty: normalized === '' ? 0 : Number(normalized) });
                  }}
                  className={`${INPUT_CLASS} mt-2`}
                />
              </div>
              {item.saleType === 'GROUPBUY' && (
                <div>
                  <label className="text-sm font-bold text-slate-700">목표 수량</label>
                  <input
                    type="number"
                    value={item.targetQty ?? ''}
                    onChange={(e) => updateItem({ targetQty: Number(e.target.value) })}
                    placeholder="목표 수량을 입력해주세요"
                    className={`${INPUT_CLASS} mt-2`}
                  />
                </div>
              )}
            </div>

            <div className="mt-2">
              <MarkdownEditor
                value={item.description}
                onChange={(next) =>
                  updateItem({ description: next, validationError: null })
                }
                placeholder="상세 설명을 입력해주세요. (마크다운 지원: # 제목, - 목록, 굵게, 링크 등)"
                minHeightClassName="min-h-[240px] md:h-[360px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div ref={thumbnailSectionRef} className="rounded-2xl bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">대표 이미지</p>
                  {item.isUploadingThumbnail && (
                    <span className="text-xs font-semibold text-slate-400">업로드 중...</span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-slate-400">대표 이미지는 1개만 등록할 수 있어요</p>

                {!thumbnailSrc && (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files ?? []);
                      if (files.length) void handleThumbnailSelect([files[0]]);
                    }}
                    className={[
                      'mt-3 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-4 text-center text-xs font-semibold transition',
                      item.isUploadingThumbnail
                        ? 'pointer-events-none border-slate-200 text-slate-400 opacity-60'
                        : 'border-slate-200 text-slate-500 hover:border-primary/60 hover:text-primary',
                    ].join(' ')}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length) void handleThumbnailSelect([files[0]]);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                    {item.isUploadingThumbnail
                      ? '업로드 중...'
                      : '드래그 & 드롭하거나 클릭해서 업로드해주세요'}
                  </label>
                )}

                {!thumbnailSrc && (
                  <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 text-xs font-semibold text-slate-400">
                    업로드된 이미지가 없어요
                  </div>
                )}

                {item.thumbnailUploadError && (
                  <p className="mt-2 text-xs text-rose-600">{item.thumbnailUploadError}</p>
                )}

                {thumbnailSrc && (
                  <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                    <img src={thumbnailSrc} alt="대표 이미지 미리보기" className="h-56 w-full object-cover" />
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 bg-white px-4 py-3">
                      <label className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        교체
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            if (files.length) void handleThumbnailSelect([files[0]]);
                            e.currentTarget.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void handleThumbnailClear()}
                        disabled={thumbnailDeleting}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {thumbnailDeleting ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div ref={detailImagesSectionRef} className="rounded-2xl bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">상세 이미지</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      상세 이미지는 여러 장 등록할 수 있어요
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">
                    현재 {item.images.length}장 업로드됨
                  </span>
                </div>
                {item.imageUploadError && (
                  <p className="mt-3 text-xs font-semibold text-rose-600">
                    {item.imageUploadError}
                  </p>
                )}

                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files ?? []);
                    if (files.length) void handleImagesUpload(files);
                  }}
                  className="mt-3 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-center text-xs font-semibold text-slate-500 transition hover:border-primary/60 hover:text-primary"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length) void handleImagesUpload(files);
                      e.currentTarget.value = '';
                    }}
                    className="hidden"
                  />
                  {isDetailUploading ? '업로드 중...' : '드래그 & 드롭하거나 클릭해서 업로드해주세요'}
                </label>

                {item.images.length === 0 ? (
                  <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 text-xs font-semibold text-slate-400">
                    업로드된 이미지가 없어요
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={imageIds} strategy={rectSortingStrategy}>
                      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                        {item.images.map((image) => (
                          <SortableImageCard
                            key={image.id}
                            item={image}
                            onRemove={handleImageRemove}
                            isDeleting={deletingImageIds.includes(image.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

          </div>
        )}
      </Reveal>
    </div>
  );
}
